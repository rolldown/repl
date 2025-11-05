<script setup lang="ts">
import { toggleDark } from '#imports'
import * as monaco from 'monaco-editor'
import {
  activeFile,
  CONFIG_FILES,
  currentVersion,
  DEFAULT_ENTRY,
  defaultFiles,
  entries,
  files,
  timeCost,
} from '~/state/bundler'
import { handleDownloadProject } from '~/utils/download'
import type { Project } from '@stackblitz/sdk'

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
    globalThis.confirm(
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

async function handleOpenInStackBlitz() {
  const { default: sdk } = await import('@stackblitz/sdk')
  const containerFiles: Record<string, string> = Object.fromEntries(
    Array.from(files.value.entries()).map(([path, file]) => {
      if (CONFIG_FILES.includes(file.filename)) {
        return [
          path,
          file.code.replaceAll(
            'import.meta.input',
            JSON.stringify(entries.value),
          ),
        ]
      }
      return [path, file.code]
    }),
  )
  containerFiles['package.json'] = JSON.stringify(
    {
      name: 'rolldown-repl-project',
      type: 'module',
      scripts: {
        build: 'rolldown -c',
      },
      devDependencies: {
        rolldown: currentVersion.value.startsWith('git@')
          ? `https://pkg.pr.new/@rolldown/browser${currentVersion.value.slice(3)}`
          : `npm:@rolldown/browser@${currentVersion.value}`,
      },
      stackblitz: {
        installDependencies: false,
        startCommand: 'pnpm install && pnpm build',
      },
    },
    null,
    2,
  )
  const project: Project = {
    files: containerFiles,
    title: 'Rolldown REPL Project',
    description: 'A project created with the Rolldown REPL',
    template: 'node',
  }
  sdk.openProject(project, { newWindow: true })
}
</script>

<template>
  <div flex="~ wrap" items-center justify-between gap2 px2 py2>
    <div flex="~ gap3" ml1 items-center>
      <img src="/lightning-down.svg" h7 />
      <h1 mr4 text-lg>Rolldown REPL</h1>
    </div>

    <div flex="~ center" gap1>
      <div
        v-if="timeCost != null"
        flex
        items-center
        gap1
        text-sm
        font-mono
        op60
        title="Time Cost"
      >
        <div i-ri:time-line />
        <span>{{ timeCost }}ms</span>
      </div>

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

      <button title="Reset State" nav-button @click="resetState">
        <div i-ri:refresh-line />
      </button>

      <button
        title="Open in StackBlitz"
        nav-button
        @click="handleOpenInStackBlitz"
      >
        <div i-vscode-icons:file-type-stackblitz scale-110 />
      </button>

      <button
        title="Download Project"
        nav-button
        @click="handleDownloadProject"
      >
        <div i-ri:download-line />
      </button>

      <button title="Toggle Dark Mode" nav-button @click="toggleDark">
        <div i-ri:sun-line dark:i-ri:moon-line />
      </button>
      <a
        href="https://rolldown.rs/"
        target="_blank"
        rel="noopener"
        title="Documentation"
        nav-button
      >
        <div i-ri:book-open-line />
      </a>
      <a
        href="https://github.com/rolldown/repl"
        target="_blank"
        rel="noopener"
        title="GitHub"
        nav-button
      >
        <div i-ri:github-line />
      </a>
    </div>
  </div>
</template>
