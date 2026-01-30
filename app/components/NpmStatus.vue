<script setup lang="ts">
import { installProgress } from '~/state/npm'
</script>

<template>
  <div
    v-if="
      installProgress.status !== 'idle' && installProgress.status !== 'done'
    "
    class="npm-badge"
    mr1
    inline-flex
    items-center
    gap1
    rounded-sm
    px2
    py0.5
    text-3
    font-mono
  >
    <template v-if="installProgress.status === 'error'">
      <div i-ri:error-warning-line text-xs />
      <span max-w-40 truncate>{{ installProgress.error }}</span>
    </template>
    <template v-else>
      <div class="npm-spinner" />
      <span v-if="installProgress.status === 'resolving'">Resolving...</span>
      <span v-else-if="installProgress.status === 'downloading'">
        {{ installProgress.downloadedPackages }}/{{
          installProgress.totalPackages
        }}...
      </span>
      <span v-else-if="installProgress.status === 'installing'">
        Installing...
      </span>
    </template>
  </div>
</template>

<style scoped>
.npm-badge {
  font-variant-numeric: tabular-nums;
  background: var(--c-bg-mute);
  color: var(--c-text-secondary);
}

.npm-badge:has(.i-ri-error-warning-line) {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}

:global(.dark) .npm-badge:has(.i-ri-error-warning-line) {
  color: #f87171;
  background: rgba(220, 38, 38, 0.12);
}

.npm-spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid var(--c-text-secondary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: npm-spin 0.6s linear infinite;
}

@keyframes npm-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
