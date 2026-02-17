<script setup lang="ts">
import {
  generateChunkGraphMermaid,
  generateModuleGraphMermaid,
} from '~/composables/graph-mermaid'
import type { ChunkNode, ModuleNode } from '~/composables/bundler'

const props = defineProps<{
  moduleGraph?: ModuleNode[]
  chunkGraph?: ChunkNode[]
  isLoading?: boolean
}>()

const activeTab = ref<'module' | 'chunk'>('module')
const { mermaidLoaded, mermaidError, renderDiagram } = useMermaid()
const moduleGraphSvg = ref<string>('')
const chunkGraphSvg = ref<string>('')
const renderError = ref<string | null>(null)

// Compute graph statistics
const stats = computed(() => {
  return {
    modules: props.moduleGraph?.length || 0,
    chunks: props.chunkGraph?.length || 0,
    entries: props.moduleGraph?.filter((m) => m.isEntry).length || 0,
  }
})

// Render module graph when data changes
watch(
  () => props.moduleGraph,
  async (modules) => {
    if (!modules || modules.length === 0) {
      moduleGraphSvg.value = ''
      return
    }

    const definition = generateModuleGraphMermaid(modules)
    const svg = await renderDiagram(definition, 'module-graph')
    if (svg) {
      moduleGraphSvg.value = svg
      renderError.value = null
    } else {
      renderError.value = 'Failed to render module graph'
    }
  },
  { immediate: true },
)

// Render chunk graph when data changes
watch(
  () => props.chunkGraph,
  async (chunks) => {
    if (!chunks || chunks.length === 0) {
      chunkGraphSvg.value = ''
      return
    }

    const definition = generateChunkGraphMermaid(chunks)
    const svg = await renderDiagram(definition, 'chunk-graph')
    if (svg) {
      chunkGraphSvg.value = svg
      renderError.value = null
    } else {
      renderError.value = 'Failed to render chunk graph'
    }
  },
  { immediate: true },
)
</script>

<template>
  <div h-full flex flex-col>
    <div flex items-center border-b border-base>
      <button
        class="graph-tab"
        :class="activeTab === 'module' && 'tab-active'"
        @click="activeTab = 'module'"
      >
        Module Graph
      </button>
      <button
        class="graph-tab"
        :class="activeTab === 'chunk' && 'tab-active'"
        @click="activeTab = 'chunk'"
      >
        Chunk Graph
      </button>
    </div>

    <div min-h-0 w-full flex-1 overflow-auto p4>
      <Loading v-if="props.isLoading" text="Loading graph..." />

      <!-- Error Message -->
      <div v-else-if="mermaidError || renderError" class="error-state">
        <div i-ph:warning text-6xl text-red op60 />
        <div mt4 text-secondary>
          {{ mermaidError || renderError }}
        </div>
      </div>

      <!-- Module Graph View -->
      <div
        v-else-if="activeTab === 'module'"
        class="graph-container"
        flex="~ col"
        items-center
      >
        <div v-if="stats.modules > 0" mb4 w-full text-sm text-secondary>
          <div>{{ stats.modules }} modules, {{ stats.entries }} entries</div>
        </div>

        <div
          v-if="moduleGraphSvg"
          class="mermaid-diagram"
          v-html="moduleGraphSvg"
        />
        <div v-else-if="!mermaidLoaded" class="empty-state">
          <div i-ph:graph text-6xl text-secondary op40 />
          <div mt4 text-secondary>Loading Mermaid...</div>
        </div>
        <div v-else class="empty-state">
          <div i-ph:graph text-6xl text-secondary op40 />
          <div mt4 text-secondary>No module graph data available</div>
        </div>
      </div>

      <!-- Chunk Graph View -->
      <div
        v-else-if="activeTab === 'chunk'"
        class="graph-container"
        flex="~ col"
        items-center
      >
        <div v-if="stats.chunks > 0" mb4 w-full text-sm text-secondary>
          <div>{{ stats.chunks }} chunks</div>
        </div>

        <div
          v-if="chunkGraphSvg"
          class="mermaid-diagram"
          v-html="chunkGraphSvg"
        />
        <div v-else-if="!mermaidLoaded" class="empty-state">
          <div i-ph:graph text-6xl text-secondary op40 />
          <div mt4 text-secondary>Loading Mermaid...</div>
        </div>
        <div v-else class="empty-state">
          <div i-ph:graph text-6xl text-secondary op40 />
          <div mt4 text-secondary>No chunk graph data available</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.graph-tab {
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

.graph-tab:hover {
  color: var(--c-text-base);
  background: var(--c-bg-mute);
}

.graph-tab.tab-active {
  color: var(--c-accent);
  border-bottom-color: var(--c-accent);
}

.graph-container {
  width: 100%;
  max-width: 100%;
}

.mermaid-diagram {
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: auto;
}

.mermaid-diagram :deep(svg) {
  max-width: 100%;
  height: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: #dc2626;
}

:global(.dark) .error-state {
  color: #f87171;
}
</style>
