<script setup lang="ts">
import { build } from '~/composables/bundler'
import { installDependencies } from '~/composables/npm'
import {
  CONFIG_FILES,
  currentVersion,
  entries,
  files,
  timeCost,
} from '~/state/bundler'
import { npmVfsFiles, userDependencies } from '~/state/npm'
import { bundlerError, bundlerOutput, bundlerStatus } from '~/state/output'

const { data: rolldownVersions } = await useRolldownVersions()

const loadingPhase = ref<'loading' | 'bundling' | null>(null)

const { data, status, error, refresh } = useAsyncData(
  'output',
  async (): Promise<TransformResult | undefined> => {
    if (!currentVersion.value) return

    let version = currentVersion.value
    if (version === 'latest') {
      version = rolldownVersions.value?.latest || 'latest'
    }

    loadingPhase.value = 'loading'

    const [core, experimental, plugins, binding] = await Promise.all([
      import(
        /* @vite-ignore */ `/api/proxy/@${version}/dist/index.browser.mjs`
      ) as Promise<typeof import('@rolldown/browser')>,
      import(
        /* @vite-ignore */ `/api/proxy/@${version}/dist/experimental-index.browser.mjs`
      ) as Promise<typeof import('@rolldown/browser/experimental')>,
      import(
        /* @vite-ignore */ `/api/proxy/@${version}/dist/plugins-index.browser.mjs`
      ).catch(() => null),
      import(
        /* @vite-ignore */ `/api/proxy/@${version}/dist/rolldown-binding.wasi-browser.js`
      ),
    ])

    loadingPhase.value = 'bundling'

    binding.__volume.reset()
    const inputFileJSON: Record<string, string> = {}
    for (const file of files.value.values()) {
      inputFileJSON[file.filename] = file.code
    }

    Object.assign(inputFileJSON, npmVfsFiles.value)

    binding.__volume.fromJSON(inputFileJSON)

    let configObject: any = {}
    const configFile =
      files.value.get(CONFIG_FILES[0]!) || files.value.get(CONFIG_FILES[1]!)
    if (configFile) {
      const { output } = await core.build({
        input: `/${configFile.filename}`,
        cwd: '/',
        output: { format: 'cjs' },
        write: false,
        external: ['rolldown', /^rolldown\//],
        transform: {
          define: { 'import.meta': 'importMeta' },
        },
      })
      const configCode = output[0].code

      if (configCode.trim()) {
        const configFn = new Function('require, module, importMeta', configCode)
        const require = (id: string) => {
          switch (id) {
            case 'rolldown':
              return core
            case 'rolldown/experimental':
              return experimental
            case 'rolldown/plugins':
              return plugins
          }
          throw new Error(`Cannot import '${id}' in config file`)
        }
        const module = { exports: {} as any }
        const importMeta = { input: entries.value }
        configFn(require, module, importMeta)

        configObject = await (module.exports?.default || module.exports)
        if (typeof configObject === 'function') {
          configObject = await configObject({
            files: files.value,
            entries: entries.value,
            api: {
              index: core,
              experimental,
              plugins,
              binding,
            },
          })
        }
      }
    }

    const startTime = performance.now()

    try {
      const result = await build(core, entries.value, configObject)
      return result
    } finally {
      loadingPhase.value = null
      timeCost.value = Math.round(performance.now() - startTime)
    }
  },
  { server: false, deep: false },
)

let npmAbort: AbortController | null = null
watch(
  userDependencies,
  async (deps) => {
    npmAbort?.abort()
    const ctrl = (npmAbort = new AbortController())

    if (Object.keys(deps).length === 0) {
      if (Object.keys(npmVfsFiles.value).length === 0) return
      npmVfsFiles.value = {}
      refresh()
      return
    }

    try {
      const { vfsFiles } = await installDependencies(deps)
      if (ctrl.signal.aborted) return
      npmVfsFiles.value = vfsFiles
      refresh()
    } catch {
      if (ctrl.signal.aborted) return
      npmVfsFiles.value = {}
    }
  },
  { immediate: true },
)

watch([files, currentVersion], () => refresh(), { deep: true })

// Sync with shared state
watch(data, (newData) => {
  bundlerOutput.value = newData
})
watch(status, (newStatus) => {
  bundlerStatus.value = newStatus
})
watch(error, (newError) => {
  bundlerError.value = newError
})

const isLoading = computed(() => status.value === 'pending')
const isLoadingDebounced = useDebounce(isLoading, 100)

const tabs = computed(() => Object.keys(data.value?.output || {}))
const activeOutputTab = ref<string>()

const errorStack = computed(() => {
  if (!error.value) return null
  console.error(error.value)
  if (!(error.value instanceof Error)) return null

  if (isSafari || isFirefox) {
    return error.value.stack
      ?.split('\n')
      .filter(Boolean) // Filter out empty lines
      .map((line) => {
        const [fn, ...file] = line.split('@')
        return `${' '.repeat(4)}at ${fn} (${file.join('@')})`
      })
      .join('\n')
  } else {
    // Chromium shows the stack along with the original message, remove it
    return error.value.stack?.replace(`Error: ${error.value.message}`, '')
  }
})

const utf16ToUTF8 = (str: string) => unescape(encodeURIComponent(str))

const sourcemapLinks = computed(() => {
  if (!data.value?.output || !data.value?.sourcemaps) return {}

  const links: Record<string, string> = {}
  for (const [fileName, code] of Object.entries(data.value.output)) {
    const sourcemap = data.value.sourcemaps[fileName]
    if (code && sourcemap) {
      const encodedCode = utf16ToUTF8(code)
      const encodedMap = utf16ToUTF8(sourcemap)
      const hash = btoa(
        `${encodedCode.length}\0${encodedCode}${encodedMap.length}\0${encodedMap}`,
      )
      links[fileName] =
        `https://evanw.github.io/source-map-visualization/#${hash}`
    }
  }

  return links
})
</script>

<template>
  <div h-full flex flex-col>
    <Loading
      v-if="isLoading && isLoadingDebounced"
      :text="loadingPhase === 'bundling' ? 'Bundling' : 'Loading Rolldown'"
    />
    <div
      v-if="status === 'error'"
      class="error-output"
      m2
      overflow-auto
      rounded-1.5
      p3
      text-3.25
    >
      <LogViewer v-if="error?.message" :source="error.message" />
      <pre v-if="errorStack" mt4 font-mono v-text="errorStack" />
    </div>
    <Tabs
      v-else-if="status === 'success' || status === 'pending'"
      v-slot="{ value }"
      v-model="activeOutputTab"
      :tabs
      readonly
      min-h-0
      w-full
      flex-1
    >
      <div min-h-0 w-full flex flex-1 flex-col>
        <CodeEditor
          :model-value="data?.output[value] || ''"
          language="javascript"
          readonly
          min-h-0
          w-full
          flex-1
        />
        <a
          v-if="sourcemapLinks[value]"
          class="sourcemap-link"
          mx3
          my2
          inline-flex
          items-center
          gap1
          text-3.25
          text-secondary
          :href="sourcemapLinks[value]"
          target="_blank"
          rel="noopener"
        >
          <span>Visualize source map</span>
          <div i-ri:arrow-right-up-line />
        </a>
      </div>
    </Tabs>
    <div
      v-if="status === 'success' && data?.warnings?.length"
      class="warnings-output"
      max-h="50%"
      overflow-y-auto
      border-t
      border-base
      px3
      py2
      pb4
      text-3.25
    >
      <LogViewer
        v-for="(warning, i) in data.warnings"
        :key="i"
        :source="warning"
      />
    </div>
  </div>
</template>

<style scoped>
.error-output {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.04);
  border: 1px solid rgba(220, 38, 38, 0.1);
}

:global(.dark) .error-output {
  background: rgba(220, 38, 38, 0.08);
  border-color: rgba(220, 38, 38, 0.15);
  color: #f87171;
}

.sourcemap-link {
  transition: color var(--transition-fast);
}

.sourcemap-link:hover {
  color: var(--c-accent);
}

.sourcemap-link div {
  width: 14px;
  height: 14px;
}

.warnings-output {
  color: #ca8a04;
}

:global(.dark) .warnings-output {
  color: #facc15;
}
</style>
