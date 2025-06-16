<script setup lang="ts">
import ansis from 'ansis'
import { build } from '~/composables/bundler'
import { CONFIG_FILES, currentVersion, files, timeCost } from '~/state/bundler'

const { data, status, error, refresh } = useAsyncData(
  'output',
  async (): Promise<TransformResult> => {
    const entries = Array.from(files.value.entries())
      .filter(([, file]) => file.isEntry)
      .map(([name]) => `/${name}`)

    const core: typeof import('@rolldown/browser') = await importUrl(
      `/api/proxy/@${currentVersion.value}/dist/index.browser.mjs`,
    )
    const experimental: typeof import('@rolldown/browser/experimental') =
      await importUrl(
        `/api/proxy/@${currentVersion.value}/dist/experimental-index.browser.mjs`,
      )

    let configObject: any = {}
    const tsConfig = files.value.get(CONFIG_FILES[0]!)
    const jsConfig = files.value.get(CONFIG_FILES[1]!)
    let configUrl: string | undefined
    if (tsConfig || jsConfig) {
      let configCode = ''
      if (tsConfig) {
        configCode = experimental.transform(
          tsConfig.filename,
          tsConfig.code,
        ).code
      } else if (jsConfig) {
        configCode = jsConfig.code
      }

      configUrl = URL.createObjectURL(
        new Blob([configCode || ''], { type: 'text/javascript' }),
      )
      const mod = await import(/* @vite-ignore */ configUrl)
      URL.revokeObjectURL(configUrl)
      configObject = mod.default || mod
      if (typeof configObject === 'function') {
        configObject = configObject({
          files: files.value,
          entries,
          api: experimental,
        })
      }
    }

    const startTime = performance.now()

    try {
      const result = await build(core, files.value, entries, configObject)
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
</script>

<template>
  <div h-full flex flex-col gap2>
    <Loading v-if="isLoading && isLoadingDebounced" />
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
      <CodeEditor
        :model-value="data?.output[value] || ''"
        language="javascript"
        readonly
        min-h-0
        w-full
        flex-1
      />
    </Tabs>
    <div
      v-if="data?.warnings?.length"
      overflow-x-auto
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
