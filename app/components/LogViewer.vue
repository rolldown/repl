<script setup lang="ts">
import ansis from 'ansis'
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

const clipboard = useClipboard()

function copyToClipboard() {
  const source = ansis.strip(props.source)
  clipboard.copy(source)
}
</script>

<template>
  <div group relative>
    <div v-if="highlighted" v-html="highlighted" />

    <button
      v-if="clipboard.isSupported.value"
      title="Copy to clipboard"
      absolute
      right-0
      top-0
      nav-button
      bg-base
      p2
      op0
      group-hover:op100
      @click="copyToClipboard"
    >
      <div v-if="clipboard.copied.value" i-ri:check-line />
      <div v-else i-ri:clipboard-line />
    </button>
  </div>
</template>
