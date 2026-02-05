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

  // Extract module graph from chunks
  const moduleMap = new Map<string, ModuleNode>()
  const chunks = result.output.filter(
    (chunk): chunk is OutputChunk => chunk.type === 'chunk',
  )

  // First pass: identify all entry modules
  const entryModules = new Set<string>()
  for (const chunk of chunks) {
    if (chunk.isEntry && chunk.facadeModuleId) {
      entryModules.add(chunk.facadeModuleId)
    }
  }

  // Second pass: build module graph from all chunks
  for (const chunk of chunks) {
    for (const [moduleId] of Object.entries(chunk.modules)) {
      if (!moduleMap.has(moduleId)) {
        moduleMap.set(moduleId, {
          id: moduleId,
          // Note: Rolldown's current output doesn't expose per-module import/importer relationships
          // These would need to be populated from the module graph API if/when available
          imports: [],
          dynamicImports: [],
          importers: [],
          dynamicImporters: [],
          isEntry: entryModules.has(moduleId),
        })
      }
    }
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
