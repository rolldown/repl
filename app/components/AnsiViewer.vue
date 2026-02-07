<script setup lang="ts">
import { createHighlighterCoreSync, createJavaScriptRegexEngine } from 'shiki'
import vitesseDark from 'shiki/themes/vitesse-black.mjs'
import vitesseLight from 'shiki/themes/vitesse-light.mjs'

const props = defineProps<{ source: string }>()

const highlighter = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
})

const highlighted = computed(() => {
  return highlighter.codeToHtml(props.source, {
    lang: 'ansi',
    theme: isDark.value ? vitesseDark : vitesseLight,
    // Remove the default background color and allow wrapping like a terminal
    rootStyle: 'white-space: break-spaces;',
  })
})
</script>

<template>
  <div v-if="highlighted" v-html="highlighted" />
</template>
