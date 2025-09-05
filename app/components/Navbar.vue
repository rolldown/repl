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

const { data: rolldownVersions } = await useRolldownVersions()

function selectCommit() {
  // eslint-disable-next-line no-alert
  const commit = prompt(
    'Enter a Rolldown commit hash, branch name, or PR number',
    'main',
  )
  if (!commit) return
  currentVersion.value = `git@${commit}`
}

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
</script>

<template>
  <div flex="~ wrap" items-center justify-between gap2 px2 py2>
    <div flex="~ gap3" ml1 items-center>
      <img src="/lightning-down.svg" h7 />
      <h1 mr4 text-lg>Rolldown REPL</h1>
    </div>

    <div flex="~ center" gap1>
      <button title="Select Commit" nav-button @click="selectCommit">
        <div i-ri:git-commit-line />
      </button>

      <select v-model="currentVersion" border rounded p1 text-sm>
        <option
          v-if="currentVersion.startsWith('git@')"
          :value="currentVersion"
        >
          pkg.pr.new: {{ currentVersion.slice(4) }}
        </option>
        <option value="latest">Latest</option>
        <option
          v-for="version of rolldownVersions?.versions.slice(0, 40)"
          :key="version"
          :value="version"
        >
          {{ version }}
        </option>
      </select>

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
