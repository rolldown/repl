import { activeFile, files } from '~/state/bundler'
import { rolldownTypeDefs } from '~/utils/rolldown-types'

export default defineNuxtPlugin(async () => {
  const monaco = await useMonaco()

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: true,
    enableSchemaRequest: true,
    trailingCommas: 'ignore',
  })

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    allowNonTsExtensions: true,
    allowImportingTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.Preserve,
    resolveJsonModule: true,
  })
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)

  // Add rolldown type definitions and global types
  monaco.languages.typescript.typescriptDefaults.setExtraLibs([
    {
      content: rolldownTypeDefs,
      filePath: 'file:///node_modules/@types/rolldown/index.d.ts',
    },
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
