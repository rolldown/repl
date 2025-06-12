<script setup lang="ts">
import { toggleDark } from '#imports'
import * as monaco from 'monaco-editor'
import {
  activeFile,
  currentVersion,
  DEFAULT_ENTRY,
  defaultFiles,
  files,
  timeCost,
} from '~/state/bundler'

function resetState() {
  if (
    // eslint-disable-next-line no-alert
    window.confirm(
      'Are you sure you want to reset the code and config to their default values?',
    )
  ) {
    monaco!.editor.getModels().forEach((model) => {
      if (model.uri.authority === 'model') return
      model.dispose()
    })
    currentVersion.value = 'latest'
    files.value = defaultFiles()
    activeFile.value = DEFAULT_ENTRY
  }
}

const { data: versions } = useAsyncData(
  'rolldown-versions',
  getRolldownVersions,
)
</script>

<template>
  <div flex="~ wrap" items-center justify-between p3>
    <div flex="~ gap2" items-center>
      <img src="/lightning-down.svg" h7 />
      <h1 mr4 text-xl>Rolldown REPL</h1>
      <select v-model="currentVersion" p="0.5" text-sm>
        <option value="latest">Latest</option>
        <option value="canary">Canary</option>
        <option
          v-for="version of versions?.slice(0, 40)"
          :key="version"
          :value="version"
        >
          {{ version }}
        </option>
      </select>
    </div>

    <div flex="~ center" gap1>
      <div flex="~ center" gap2>
        <div
          v-if="timeCost != null"
          flex
          items-center
          gap1
          text-sm
          font-mono
          title="Time Cost"
        >
          <div i-ri:time-line op60 />
          <span op80>{{ timeCost }}ms</span>
        </div>
      </div>

      <button title="Reset State" nav-button @click="resetState">
        <div i-ri:refresh-line />
      </button>

      <button title="Toggle Dark Mode" nav-button @click="toggleDark">
        <div i-ri:sun-line dark:i-ri:moon-line />
      </button>
      <a
        href="https://github.com/rolldown/repl"
        target="_blank"
        title="GitHub"
        nav-button
      >
        <div i-ri:github-line />
      </a>
    </div>
  </div>
</template>
