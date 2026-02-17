<script setup lang="ts">
import { bundlerOutput, bundlerStatus } from '~/state/output'

const activeTab = ref<'output' | 'graph'>('output')

const isLoading = computed(() => bundlerStatus.value === 'pending')
</script>

<template>
  <div h-full flex flex-col>
    <div flex items-center border-b border-base>
      <button
        class="view-tab"
        :class="activeTab === 'output' && 'tab-active'"
        @click="activeTab = 'output'"
      >
        Output
      </button>
      <button
        class="view-tab"
        :class="activeTab === 'graph' && 'tab-active'"
        @click="activeTab = 'graph'"
      >
        Graph
      </button>
    </div>

    <div min-h-0 flex-1>
      <OutputContainer v-show="activeTab === 'output'" h-full />
      <GraphContainer
        v-show="activeTab === 'graph'"
        :module-graph="bundlerOutput?.moduleGraph"
        :chunk-graph="bundlerOutput?.chunkGraph"
        :is-loading="isLoading"
        h-full
      />
    </div>
  </div>
</template>

<style scoped>
.view-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  color: var(--c-text-secondary);
  border-bottom: 2px solid transparent;
  transition:
    color var(--transition-fast),
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.view-tab:hover {
  color: var(--c-text-base);
  background: var(--c-bg-mute);
}

.view-tab.tab-active {
  color: var(--c-accent);
  border-bottom-color: var(--c-accent);
}
</style>
