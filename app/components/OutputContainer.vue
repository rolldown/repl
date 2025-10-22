<script setup lang="ts">
import ansis from 'ansis'
import { build } from '~/composables/bundler'
import {
  CONFIG_FILES,
  currentVersion,
  entries,
  files,
  timeCost,
} from '~/state/bundler'

const { data: rolldownVersions } = await useRolldownVersions()

const { data, status, error, refresh } = useAsyncData(
  'output',
  async (): Promise<TransformResult | undefined> => {
    if (!currentVersion.value) return

    let version = currentVersion.value
    if (version === 'latest') {
      version = rolldownVersions.value?.latest || 'latest'
    }

    const [core, experimental, binding] = await Promise.all([
      import(
        /* @vite-ignore */ `/api/proxy/@${version}/dist/index.browser.mjs`
      ) as Promise<typeof import('@rolldown/browser')>,
      import(
        /* @vite-ignore */ `/api/proxy/@${version}/dist/experimental-index.browser.mjs`
      ) as Promise<typeof import('@rolldown/browser/experimental')>,
      import(
        /* @vite-ignore */ `/api/proxy/@${version}/dist/rolldown-binding.wasi-browser.js`
      ),
    ])

    binding.__volume.reset()
    const inputFileJSON: Record<string, string> = {}
    for (const file of files.value.values()) {
      inputFileJSON[file.filename] = file.code
    }
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
        external: ['rolldown', 'rolldown/experimental'],
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
      timeCost.value = Math.round(performance.now() - startTime)
    }
  },
  { server: false, deep: false },
)

watch([files, currentVersion], () => refresh(), {
  deep: true,
})

const isLoading = computed(() => status.value === 'pending')
const isLoadingDebounced = useDebounce(isLoading, 100)

const tabs = computed(() => Object.keys(data.value?.output || {}))

const errorText = computed(() => {
  if (!error.value) return ''
  console.error(error.value)
  const str = ansis.strip(String(error.value))
  let stack: string | undefined
  if (error.value instanceof Error) {
    stack = error.value.stack
    stack &&= ansis.strip(stack)
    if (isSafari)
      stack = stack
        ?.split('\n')
        .map((line) => {
          const [fn, file] = line.split('@', 2)
          return `${' '.repeat(4)}at ${fn} (${file})`
        })
        .join('\n')
  }
  return `${str}\n\n${stack && str !== stack ? `${stack}\n` : ''}`
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
  <div h-full flex flex-col gap2>
    <Loading v-if="isLoading && isLoadingDebounced" text="Bundling" />
    <div
      v-if="status === 'error'"
      overflow-auto
      whitespace-pre
      text-sm
      text-red
      font-mono
      v-text="errorText"
    />
    <Tabs
      v-else-if="status === 'success' || status === 'pending'"
      v-slot="{ value }"
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
          class="m-2 flex items-center self-start text-sm opacity-80"
          :href="sourcemapLinks[value]"
          target="_blank"
          rel="noopener"
        >
          <span
            class="text-[#3c3c43] font-medium dark:text-[#fffff5]/[.86] hover:text-[#3451b2] dark:hover:text-[#a8b1ff]"
          >
            Visualize source map
          </span>
          <div
            class="i-ri:arrow-right-up-line ml-1 h-3 w-3 text-[#3c3c43]/[.56] dark:text-[#fffff5]/[.6]"
          />
        </a>
      </div>
    </Tabs>
    <div
      v-if="status === 'success' && data?.warnings?.length"
      overflow-x-auto
      max-h="50%"
      whitespace-pre
      pb4
      text-sm
      text-yellow-600
      font-mono
      dark:text-yellow
    >
      {{ ansis.strip(data?.warnings.join('\n') || '') }}
    </div>
  </div>
</template>
