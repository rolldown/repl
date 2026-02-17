import type {
  InputOptions,
  OutputChunk,
  OutputOptions,
} from '@rolldown/browser'

export interface ModuleNode {
  id: string
  imports: string[]
  dynamicImports: string[]
  importers: string[]
  dynamicImporters: string[]
  isEntry: boolean
}

export interface ChunkNode {
  fileName: string
  name: string
  isEntry: boolean
  isDynamicEntry: boolean
  imports: string[]
  dynamicImports: string[]
  exports: string[]
  modules: string[]
}

export interface TransformResult {
  output: Record<string, string>
  sourcemaps?: Record<string, string>
  warnings?: string[]
  moduleGraph?: ModuleNode[]
  chunkGraph?: ChunkNode[]
}

export async function build(
  core: typeof import('@rolldown/browser'),
  input: string[],
  config: any,
): Promise<TransformResult> {
  const warnings: string[] = []

  // Collect module information using a plugin
  const moduleInfoMap = new Map<
    string,
    {
      importedIds: string[]
      dynamicallyImportedIds: string[]
      importers: string[]
      dynamicImporters: string[]
      isEntry: boolean
    }
  >()

  const moduleGraphPlugin = {
    name: 'collect-module-graph',
    buildEnd() {
      // Collect all module info during buildEnd hook
      const moduleIds = this.getModuleIds()
      for (const id of moduleIds) {
        const info = this.getModuleInfo(id)
        if (info) {
          moduleInfoMap.set(id, {
            importedIds: info.importedIds,
            dynamicallyImportedIds: info.dynamicallyImportedIds,
            importers: info.importers,
            dynamicImporters: info.dynamicImporters,
            isEntry: info.isEntry,
          })
        }
      }
    },
  }

  const inputOptions: InputOptions = {
    input,
    cwd: '/',
    onLog(level, log, logger) {
      if (level === 'warn') {
        warnings.push(String(log))
      } else {
        logger(level, log)
      }
    },
    plugins: [moduleGraphPlugin, ...(config?.plugins || [])],
    ...config,
  }
  const outputOptions: OutputOptions = {
    format: 'esm',
    ...config?.output,
  }
  console.info('Rolldown input options', inputOptions)
  console.info('Rolldown output options', outputOptions)
  const bundle = await core.rolldown(inputOptions)
  const result = await bundle.generate(outputOptions)
  const output = Object.fromEntries(
    result.output.map((chunk) =>
      chunk.type === 'chunk'
        ? [chunk.fileName, chunk.code]
        : [
            chunk.fileName,
            typeof chunk.source === 'string' ? chunk.source : '[BINARY]',
          ],
    ),
  )

  const sourcemaps = Object.fromEntries(
    result.output
      .filter(
        (chunk): chunk is OutputChunk => chunk.type === 'chunk' && !!chunk.map,
      )
      .map((chunk) => [
        chunk.fileName,
        typeof chunk.map === 'string' ? chunk.map : JSON.stringify(chunk.map),
      ]),
  )

  // Extract module graph from chunks using collected module info
  const moduleMap = new Map<string, ModuleNode>()
  const chunks = result.output.filter(
    (chunk): chunk is OutputChunk => chunk.type === 'chunk',
  )

  // Build module graph from collected module information
  for (const [moduleId, info] of moduleInfoMap.entries()) {
    moduleMap.set(moduleId, {
      id: moduleId,
      imports: info.importedIds,
      dynamicImports: info.dynamicallyImportedIds,
      importers: info.importers,
      dynamicImporters: info.dynamicImporters,
      isEntry: info.isEntry,
    })
  }

  // Extract chunk graph
  const chunkGraph: ChunkNode[] = chunks.map((chunk) => ({
    fileName: chunk.fileName,
    name: chunk.name,
    isEntry: chunk.isEntry,
    isDynamicEntry: chunk.isDynamicEntry,
    imports: chunk.imports,
    dynamicImports: chunk.dynamicImports,
    exports: chunk.exports,
    modules: Object.keys(chunk.modules),
  }))

  return {
    output,
    sourcemaps,
    warnings,
    moduleGraph: Array.from(moduleMap.values()),
    chunkGraph,
  }
}
