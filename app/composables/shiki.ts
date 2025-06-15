import { createHighlighterCoreSync, createJavaScriptRegexEngine } from 'shiki'
import langCss from 'shiki/langs/css.mjs'
import langHtml from 'shiki/langs/html.mjs'
import langJs from 'shiki/langs/javascript.mjs'
import langJson from 'shiki/langs/json.mjs'
import langJsx from 'shiki/langs/jsx.mjs'
import langTsx from 'shiki/langs/tsx.mjs'
import langTs from 'shiki/langs/typescript.mjs'
import langVue from 'shiki/langs/vue.mjs'
import langYaml from 'shiki/langs/yaml.mjs'
import vitesseDark from 'shiki/themes/vitesse-dark.mjs'
import vitesseLight from 'shiki/themes/vitesse-light.mjs'

export const shikiLangs = [
  langJs,
  langJsx,
  langTs,
  langTsx,
  langVue,
  langJson,
  langHtml,
  langCss,
  langYaml,
]
export const highlighter = createHighlighterCoreSync({
  langs: shikiLangs,
  themes: [vitesseLight, vitesseDark],
  engine: createJavaScriptRegexEngine(),
})
