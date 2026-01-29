import { activeFile, currentVersion, files } from '~/state/bundler'
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

  // Get the current version for fetching type definitions
  const { data: rolldownVersions } = await useRolldownVersions()
  let version = currentVersion.value || 'latest'
  if (version === 'latest') {
    version = rolldownVersions.value?.latest || 'latest'
  }

  const extraLibs: Array<{ content: string; filePath?: string }> = [
    {
      content: `declare global {
        interface ImportMeta { input: string }
      }
      export {}`,
    },
  ]

  // Try to fetch rolldown type definitions from jsdelivr CDN
  // Falls back to hardcoded definitions if fetching fails
  let typesLoaded = false
  try {
    // Fetch the bundled type definition file from jsdelivr CDN
    const response = await fetch(
      `https://cdn.jsdelivr.net/npm/rolldown@${version}/dist/index.d.mts`,
    )

    if (response.ok) {
      const typeContent = await response.text()

      // The type file may have relative imports, so we use it as an ambient declaration
      extraLibs.push({
        content: typeContent,
      })

      typesLoaded = true
      console.info(
        `Loaded rolldown type definitions from jsdelivr CDN (v${version})`,
      )
    }
  } catch (error) {
    console.warn('Failed to load rolldown types from jsdelivr CDN:', error)
  }

  // Fallback to hardcoded type definitions if CDN fetch failed
  if (!typesLoaded) {
    extraLibs.push({
      content: rolldownTypeDefs,
    })
    console.info('Using fallback rolldown type definitions')
  }

  // Apply type definitions to Monaco
  monaco.languages.typescript.typescriptDefaults.setExtraLibs(extraLibs)

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
