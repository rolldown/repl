<script setup lang="ts">
const { text = 'Loading' } = defineProps<{
  text?: string
}>()
</script>

<template>
  <div class="loading-container">
    <div class="loading-spinner">
      <div class="spinner-ring" />
    </div>
    <span class="loading-text">{{ text }}</span>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  position: relative;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2.5px solid var(--c-border);
  border-top-color: var(--c-accent);
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.loading-text {
  font-size: 13px;
  color: var(--c-text-secondary);
  letter-spacing: 0.02em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
