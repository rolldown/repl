import { resolve } from 'pathe'
import { currentVersion } from '~/state/bundler'
import type { InputOptions, OutputOptions } from '@rolldown/browser'

export interface TransformResult {
  output: Record<string, string>
  warnings?: string[]
}

export async function build(
  files: SourceFileMap,
  input: string[],
  config: any,
): Promise<TransformResult> {
  const mod: typeof import('@rolldown/browser') = await importUrl(
    `/api/proxy/@${currentVersion.value}/dist/index.browser.mjs`,
  )

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
    plugins: [
      {
        name: 'bundler-explorer:fs',
        resolveId(source, importer) {
          if (source[0] === '/' || source[0] === '.') {
            return resolve(importer || '/', '..', source)
          }
        },
        load(id) {
          if (id[0] !== '/') return
          id = id.slice(1)
          if (files.has(id)) {
            return files.get(id)!.code
          }
        },
      },
      config?.plugins,
    ],
  }
  const outputOptions: OutputOptions = {
    format: 'esm',
    ...config?.output,
  }
  console.info('Rolldown input options', inputOptions)
  console.info('Rolldown output options', outputOptions)
  const bundle = await mod.rolldown(inputOptions)
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
  return {
    output,
    warnings,
  }
}
