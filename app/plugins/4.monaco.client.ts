import { activeFile, files } from '~/state/bundler'

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

  // Add global type definitions
  monaco.languages.typescript.typescriptDefaults.setExtraLibs([
    {
      content: `declare global {
        interface ImportMeta { input: string }
      }
      export {}`,
    },
  ])

  // Note: Type definitions for npm packages (including rolldown) are automatically
  // fetched by monaco-editor-auto-typings which is configured in CodeEditor.vue
  // It will detect imports like "import type { RolldownOptions } from 'rolldown'"
  // and automatically fetch the type definitions from jsdelivr CDN

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
