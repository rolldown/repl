<script setup lang="ts">
import { activeFile, CONFIG_FILES, files } from '~/state/bundler'

const tabs = computed(() => Array.from(files.value.keys()))

function updateCode(name: string, code: string) {
  files.value.get(name)!.code = code
}

function addTab(name: string) {
  files.value.set(name, useSourceFile(name, ''))
}

function renameTab(oldName: string, newName: string) {
  files.value = new Map(
    Array.from(files.value.entries()).map(([key, value]) => {
      if (key === oldName) {
        value.rename(newName)
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
  <div flex="~ col" pl3>
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
          input
          h-full
          min-h-0
          w-full
          @update:model-value="updateCode(value, $event)"
        />
      </template>

      <template #tab-prefix="{ value }">
        <div
          v-if="
            value === 'tsconfig.json' ||
            (value.startsWith('tsconfig.') && value.endsWith('.json'))
          "
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
          p="0.5"
          mr="0.5"
          rounded-full
          text-sm
          op80
          hover:bg-op-60
          :class="
            files.get(value)?.isEntry
              ? 'bg-#d44803 text-white bg-op-90'
              : 'bg-gray bg-op-0'
          "
          @click="setEntry(value)"
        >
          <div title="Toggle Entry" i-ph:house-line-duotone />
        </button>
      </template>
    </Tabs>
  </div>
</template>
