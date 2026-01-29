<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'

const { tabs, readonly } = defineProps<{
  tabs: string[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  addTab: [name: string]
  renameTab: [oldName: string, newName: string]
  removeTab: [name: string]
  moveTab: [fromIndex: number, toIndex: number]
}>()

const active = defineModel<string>({
  default(props: { tabs: string[] }) {
    return props.tabs[0]
  },
})

watch(
  [active, () => tabs],
  () => {
    if (!tabs.includes(active.value)) {
      active.value = tabs[0]!
    }
  },
  { deep: true },
)

const renamingTab = ref<string>()
const renameInput = ref('')
const renameInputRef = useTemplateRef<HTMLInputElement[]>('rename-input')
const tabsRef = useTemplateRef<HTMLDivElement>('tabsRef')

// Drag and drop state
const draggingIndex = ref<number>()
const dragOverIndex = ref<number>()

function addTab() {
  const base = 'untitled'
  let idx = 1
  let name = base
  while (tabs.includes(name)) {
    name = `${base}-${idx++}`
  }
  emit('addTab', name)
  active.value = name
  startRename(name)
}

async function startRename(name: string) {
  renamingTab.value = name
  renameInput.value = name
  await nextTick()
  renameInputRef.value?.[0]?.focus()
  renameInputRef.value?.[0]?.select()
}

function finishRename(oldName: string) {
  const newName = renameInput.value.trim()
  if (newName && newName !== oldName && !tabs.includes(newName)) {
    emit('renameTab', oldName, newName)
    if (active.value === oldName) {
      active.value = newName
    }
  }
  renamingTab.value = undefined
}

function cancelRename() {
  renamingTab.value = undefined
}

function removeTab(name: string) {
  if (tabs.length <= 1) return
  emit('removeTab', name)
  if (active.value === name) {
    active.value = tabs[0]!
  }
}

function horizontalScroll(e: WheelEvent) {
  const el = tabsRef.value!
  const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  el.scrollTo({
    left: el.scrollLeft + delta,
  })
}

function onDragStart(index: number, e: DragEvent) {
  if (readonly) return
  draggingIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

function onDragOver(index: number, e: DragEvent) {
  if (readonly || draggingIndex.value === null) return
  e.preventDefault()
  dragOverIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function onDragLeave() {
  if (draggingIndex.value !== undefined) {
    dragOverIndex.value = undefined
  }
}

function onDrop(toIndex: number, e: DragEvent) {
  if (readonly || draggingIndex.value === undefined) return
  e.preventDefault()
  const fromIndex = draggingIndex.value
  if (fromIndex !== toIndex) {
    emit('moveTab', fromIndex, toIndex)
  }
  draggingIndex.value = undefined
  dragOverIndex.value = undefined
}

function onDragEnd() {
  draggingIndex.value = undefined
  dragOverIndex.value = undefined
}
</script>

<template>
  <div flex="~ col" gap2>
    <div class="tabs-bar">
      <div
        ref="tabsRef"
        flex
        flex-nowrap
        overflow-x-auto
        class="tabs"
        @wheel.prevent="horizontalScroll"
      >
        <div
          v-for="(name, index) of tabs"
          :key="name"
          class="tab-item"
          group
          :draggable="!readonly"
          :class="[
            active === name && 'tab-active',
            renamingTab === name && 'tab-renaming',
            readonly && 'pr2',
            draggingIndex === index && 'tab-dragging',
            dragOverIndex === index && 'tab-dragover',
          ]"
          @click="active = name"
          @dblclick="!readonly && startRename(name)"
          @dragstart="onDragStart(index, $event)"
          @dragover="onDragOver(index, $event)"
          @dragleave="onDragLeave"
          @drop="onDrop(index, $event)"
          @dragend="onDragEnd"
        >
          <slot name="tab-prefix" :value="name" />

          <input
            v-if="renamingTab === name"
            ref="rename-input"
            v-model="renameInput"
            class="tab-rename-input"
            style="field-sizing: content"
            spellcheck="false"
            @keydown.enter.prevent="finishRename(name)"
            @keydown.esc.prevent="cancelRename()"
            @blur="finishRename(name)"
          />
          <span v-else class="tab-label">
            {{ name }}
          </span>

          <button
            v-if="!readonly && tabs.length > 1"
            title="Remove"
            class="tab-close"
            :class="active === name && 'active-close'"
            @click.stop="removeTab(name)"
          >
            <div i-ri:close-line text-3 />
          </button>
        </div>
      </div>

      <button v-if="!readonly" class="tab-add" title="New file" @click="addTab">
        <div i-ri:add-line text-sm />
      </button>
    </div>

    <slot :value="active" />
  </div>
</template>

<style scoped>
.tabs-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--c-border);
}

.tabs {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.tabs::-webkit-scrollbar {
  height: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 6px 6px 10px;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  font-size: 13px;
  font-family: 'DM Mono', ui-monospace, monospace;
  color: var(--c-text-secondary);
  border-bottom: 2px solid transparent;
  transition:
    color var(--transition-fast),
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.tab-item:hover {
  color: var(--c-text-base);
  background: var(--c-bg-mute);
}

.tab-item.tab-active {
  color: var(--c-accent);
  border-bottom-color: var(--c-accent);
}

.tab-item.tab-renaming {
  background: var(--c-bg-mute);
}

.tab-item.tab-dragging {
  opacity: 0.4;
}

.tab-item.tab-dragover {
  background: var(--c-accent-soft);
}

.tab-label {
  white-space: nowrap;
}

.tab-rename-input {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 13px;
  font-family: inherit;
  color: inherit;
  outline: none;
  border-radius: 0;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition:
    opacity var(--transition-fast),
    background var(--transition-fast);
}

.tab-item:hover .tab-close,
.tab-close.active-close {
  opacity: 0.5;
}

.tab-close:hover {
  opacity: 1 !important;
  background: var(--c-bg-mute);
}

.tab-add {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  margin-right: 4px;
  padding: 4px;
  border-radius: var(--radius-sm);
  color: var(--c-text-secondary);
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.tab-add:hover {
  background: var(--c-bg-mute);
  color: var(--c-text-base);
}
</style>
