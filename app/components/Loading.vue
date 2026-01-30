<script setup lang="ts">
const { text = 'Loading' } = defineProps<{
  text?: string
}>()
</script>

<template>
  <div flex="~ col center" h-full w-full gap3>
    <div relative h8 w8>
      <div class="spinner-ring" />
    </div>
    <span text-3.25 text-secondary tracking-wide>{{ text }}</span>
  </div>
</template>

<style scoped>
.spinner-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2.5px solid var(--c-border);
  border-top-color: var(--c-accent);
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
