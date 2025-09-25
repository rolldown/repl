import type {
  InputOptions,
  OutputChunk,
  OutputOptions,
} from '@rolldown/browser'

export interface TransformResult {
  output: Record<string, string>
  sourcemaps?: Record<string, string>
  warnings?: string[]
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

  return {
    output,
    sourcemaps,
    warnings,
  }
}
