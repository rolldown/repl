<script setup lang="ts">
import {
  activeFile,
  CONFIG_FILES,
  configTemplate,
  currentVersion,
  files,
  TSCONFIG_FILES,
  tsconfigTemplate,
} from '~/state/bundler'

const tabs = computed(() => Array.from(files.value.keys()))

function updateCode(name: string, code: string) {
  files.value.get(name)!.code = code
}

function addTab(name: string) {
  let initialCode = ''
  if (CONFIG_FILES.includes(name)) {
    initialCode = configTemplate
  } else if (TSCONFIG_FILES.includes(name)) {
    initialCode = tsconfigTemplate
  }
  files.value.set(name, useSourceFile(name, initialCode))
}

function renameTab(oldName: string, newName: string) {
  files.value = new Map(
    Array.from(files.value.entries()).map(([key, value]) => {
      if (key === oldName) {
        value.rename(newName)
        // Apply template if renamed to a config file and currently empty
        if (CONFIG_FILES.includes(newName) && !value.code.trim()) {
          value.code = configTemplate
        } else if (TSCONFIG_FILES.includes(newName) && !value.code.trim()) {
          value.code = tsconfigTemplate
        }
        return [newName, value]
      }
      return [key, value]
    }),
  )
}

function removeTab(name: string) {
  files.value.get(name)?.dispose()
  files.value.delete(name)
}

function moveTab(fromIndex: number, toIndex: number) {
  const entries = Array.from(files.value.entries())
  if (fromIndex >= 0 && fromIndex < entries.length) {
    const [movedEntry] = entries.splice(fromIndex, 1)
    entries.splice(toIndex, 0, movedEntry!)
    files.value = new Map(entries)
  }
}

function setEntry(name: string) {
  const file = files.value.get(name)
  if (file) {
    file.isEntry = !file.isEntry
  }
}
</script>

<template>
  <div class="input-panel">
    <Tabs
      v-model="activeFile"
      :tabs
      h-full
      min-h-0
      w-full
      @add-tab="addTab"
      @rename-tab="renameTab"
      @remove-tab="removeTab"
      @move-tab="moveTab"
    >
      <template #default="{ value }">
        <CodeEditor
          :model-value="files.get(value)!.code"
          :model="files.get(value)!.model"
          :uri="files.get(value)!.uri"
          :rolldown-version="currentVersion"
          input
          h-full
          min-h-0
          w-full
          @update:model-value="updateCode(value, $event)"
        />
      </template>

      <template #tab-prefix="{ value }">
        <div
          v-if="value.startsWith('tsconfig.') && value.endsWith('.json')"
          i-vscode-icons:file-type-tsconfig
          h-3.5
          title="TypeScript Config"
        />
        <img
          v-else-if="CONFIG_FILES.includes(value)"
          src="/rolldown-bracketless.svg"
          h-3.5
          title="Config File"
        />
        <button
          v-else
          title="Toggle Entry"
          class="entry-toggle"
          :class="files.get(value)?.isEntry && 'entry-active'"
          @click="setEntry(value)"
        >
          <div title="Toggle Entry" i-ph:house-line-duotone />
        </button>
      </template>
    </Tabs>
  </div>
</template>

<style scoped>
.input-panel {
  display: flex;
  flex-direction: column;
}

.entry-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  margin-right: 2px;
  border-radius: 50%;
  font-size: 13px;
  opacity: 0.6;
  color: var(--c-text-secondary);
  transition: all var(--transition-fast);
}

.entry-toggle:hover {
  opacity: 0.9;
  background: var(--c-bg-mute);
}

.entry-toggle.entry-active {
  background: var(--c-accent);
  color: white;
  opacity: 0.95;
}

.entry-toggle.entry-active:hover {
  opacity: 1;
}
</style>
