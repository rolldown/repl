<script setup lang="ts">
import type { ChunkNode, ModuleNode } from '~/composables/bundler'

const props = defineProps<{
  moduleGraph?: ModuleNode[]
  chunkGraph?: ChunkNode[]
  isLoading?: boolean
}>()

const activeTab = ref<'module' | 'chunk'>('module')

// Compute graph statistics
const stats = computed(() => {
  return {
    modules: props.moduleGraph?.length || 0,
    chunks: props.chunkGraph?.length || 0,
    entries: props.moduleGraph?.filter((m) => m.isEntry).length || 0,
  }
})
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

      <!-- Module Graph View -->
      <div v-else-if="activeTab === 'module' && props.moduleGraph">
        <div mb4 text-sm text-secondary>
          <div>{{ stats.modules }} modules, {{ stats.entries }} entries</div>
        </div>

        <div class="graph-nodes">
          <div
            v-for="module in props.moduleGraph"
            :key="module.id"
            class="graph-node"
            :class="module.isEntry && 'entry-node'"
          >
            <div class="node-title" flex items-center gap2>
              <div
                v-if="module.isEntry"
                i-ph:house-line-duotone
                text-accent
                title="Entry module"
              />
              <span text-3.25 font-mono>{{ module.id }}</span>
            </div>

            <div mt2 text-3 text-secondary>
              <div v-if="module.imports.length > 0">
                <div font-medium>Imports ({{ module.imports.length }}):</div>
                <div v-for="imp in module.imports" :key="imp" ml2 font-mono>
                  → {{ imp }}
                </div>
              </div>

              <div v-if="module.dynamicImports.length > 0" mt1>
                <div font-medium>
                  Dynamic Imports ({{ module.dynamicImports.length }}):
                </div>
                <div
                  v-for="imp in module.dynamicImports"
                  :key="imp"
                  ml2
                  font-mono
                >
                  ⇢ {{ imp }}
                </div>
              </div>

              <div v-if="module.importers.length > 0" mt1>
                <div font-medium>
                  Imported by ({{ module.importers.length }}):
                </div>
                <div
                  v-for="importer in module.importers"
                  :key="importer"
                  ml2
                  font-mono
                >
                  ← {{ importer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chunk Graph View -->
      <div v-else-if="activeTab === 'chunk' && props.chunkGraph">
        <div mb4 text-sm text-secondary>
          <div>{{ stats.chunks }} chunks</div>
        </div>

        <div class="graph-nodes">
          <div
            v-for="chunk in props.chunkGraph"
            :key="chunk.fileName"
            class="graph-node"
            :class="chunk.isEntry && 'entry-node'"
          >
            <div class="node-title" flex items-center gap2>
              <div
                v-if="chunk.isEntry"
                i-ph:house-line-duotone
                text-accent
                title="Entry chunk"
              />
              <span text-3.25 font-mono>{{ chunk.fileName }}</span>
              <span v-if="chunk.isDynamicEntry" text-2.75 text-secondary>
                (dynamic)
              </span>
            </div>

            <div mt2 text-3 text-secondary>
              <div v-if="chunk.modules.length > 0">
                <div font-medium>Modules ({{ chunk.modules.length }}):</div>
                <div v-for="mod in chunk.modules" :key="mod" ml2 font-mono>
                  • {{ mod }}
                </div>
              </div>

              <div v-if="chunk.imports.length > 0" mt1>
                <div font-medium>Imports ({{ chunk.imports.length }}):</div>
                <div v-for="imp in chunk.imports" :key="imp" ml2 font-mono>
                  → {{ imp }}
                </div>
              </div>

              <div v-if="chunk.dynamicImports.length > 0" mt1>
                <div font-medium>
                  Dynamic Imports ({{ chunk.dynamicImports.length }}):
                </div>
                <div
                  v-for="imp in chunk.dynamicImports"
                  :key="imp"
                  ml2
                  font-mono
                >
                  ⇢ {{ imp }}
                </div>
              </div>

              <div v-if="chunk.exports.length > 0" mt1>
                <div font-medium>Exports ({{ chunk.exports.length }}):</div>
                <div v-for="exp in chunk.exports" :key="exp" ml2 font-mono>
                  ↗ {{ exp }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div i-ph:graph text-6xl text-secondary op40 />
        <div mt4 text-secondary>
          No {{ activeTab === 'module' ? 'module' : 'chunk' }} graph data
          available
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

.graph-nodes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.graph-node {
  padding: 12px 16px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  background: var(--c-bg);
  transition: border-color var(--transition-fast);
}

.graph-node:hover {
  border-color: var(--c-border-hover);
}

.graph-node.entry-node {
  border-color: var(--c-accent);
  border-width: 2px;
  background: var(--c-accent-soft);
}

.node-title {
  color: var(--c-text-base);
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}
</style>
