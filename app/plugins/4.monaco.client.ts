import { activeFile, files } from '~/state/bundler'

export default defineNuxtPlugin(async () => {
  const monaco: typeof import('monaco-editor') = await useMonaco()

  monaco.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: true,
    enableSchemaRequest: true,
    trailingCommas: 'ignore',
    schemas: [
      {
        uri: 'https://json.schemastore.org/tsconfig.json',
        fileMatch: ['tsconfig*.json'],
      },
    ],
  })

  monaco.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.typescript.ScriptTarget.ESNext,
    module: monaco.typescript.ModuleKind.ESNext,
    allowNonTsExtensions: true,
    allowImportingTsExtensions: true,
    moduleResolution: monaco.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.typescript.JsxEmit.Preserve,
    resolveJsonModule: true,
  })
  monaco.typescript.typescriptDefaults.setEagerModelSync(true)
  monaco.typescript.typescriptDefaults.setExtraLibs([
    {
      content: `declare global {
        interface ImportMeta { input: string }
      }
      export {}`,
    },
  ])

  monaco.editor.registerEditorOpener({
    openCodeEditor(_, resource) {
      if (resource.scheme !== 'file' || resource.path[0] !== '/') {
        return false
      }
      const path = resource.path.slice(1)
      if (!files.value.has(path)) {
        return false
      }
      activeFile.value = path
      return true
    },
  })
})
