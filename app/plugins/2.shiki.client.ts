import { shikiToMonaco } from '@shikijs/monaco'
import * as monaco from 'monaco-editor'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import themeDark from 'shiki/themes/dark-plus.mjs'
import themeLight from 'shiki/themes/light-plus.mjs'
import { shikiLangs } from '~/composables/shiki'

export default defineNuxtPlugin(() => {
  monaco.languages.register({ id: 'vue' })

  const highlighter = createHighlighterCoreSync({
    themes: [themeDark, themeLight],
    langs: shikiLangs,
    engine: createJavaScriptRegexEngine(),
  })
  shikiToMonaco(highlighter, monaco)
})
