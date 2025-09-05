<script setup lang="ts">
const { text = 'Loading' } = defineProps<{
  text?: string
}>()
</script>

<template>
  <div flex="~ col center" h-full w-full gap2>
    <div i-ri:loader-2-line animate-spin text-4xl />
    <span text-lg>{{ text }}...</span>
  </div>
</template>
