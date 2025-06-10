import { rolldown as build, VERSION as version } from '@rolldown/browser'
import * as RolldownAPI from '@rolldown/browser'
import * as RolldownExperimentalAPI from '@rolldown/browser/experimental'
import { resolve } from 'pathe'
// @ts-expect-error missing types
import * as RolldownBinding from '../../node_modules/@rolldown/browser/dist/rolldown-binding.wasi-browser'

export type Awaitable<T> = T | Promise<T>
export interface Bundler<T = void> {
  id: string
  name: string
  icon: string
  pkgName: string
  version: string
  api?: any

  init?: () => Awaitable<T>
  initted?: boolean

  configFile: string

  build: (
    this: T,
    files: SourceFileMap,
    entries: string[],
    config: any,
  ) => Awaitable<TransformResult>
}

export interface TransformResult {
  output: Record<string, string>
  warnings?: string[]
}

// @unocss-include

export const rolldown: Bundler = {
  id: 'rolldown',
  name: 'Rolldown',
  icon: 'i-vscode-icons:file-type-rolldown',
  version,
  pkgName: '@rolldown/browser',
  configFile: 'rolldown.config.js',
  api: {
    ...RolldownAPI,
    experimental: RolldownExperimentalAPI,
    _binding: RolldownBinding,
  },
  async build(files, input, config) {
    const warnings: string[] = []

    const inputOptions: RolldownAPI.InputOptions = {
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
    const outputOptions: RolldownAPI.OutputOptions = {
      format: 'esm',
      ...config?.output,
    }
    console.info('Rolldown input options', inputOptions)
    console.info('Rolldown output options', outputOptions)

    const bundle = await build(inputOptions)
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
  },
}
