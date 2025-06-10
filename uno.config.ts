import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  shortcuts: {
    'border-base': 'border-$c-border',
    'border-bg-base': 'border-$c-bg-base',

    'bg-base': 'bg-$c-bg-base',
    'bg-glass': 'bg-white:75 dark:bg-#111:75 backdrop-blur-5',

    'text-base': 'text-$c-text-base',

    'flex-center': 'items-center justify-center',
    'flex-x-center': 'justify-center',
    'flex-y-center': 'items-center',

    'nav-button':
      'flex flex-center rounded-md p1.5 hover:bg-gray hover:bg-opacity-20',

    'z-panel': 'z-10',
  },
  presets: [
    presetUno({
      attributifyPseudo: true,
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        color: 'inherit',
        // Avoid crushing of icons in crowded situations
        'min-width': '1.2em',
      },
    }),
  ],
  transformers: [transformerDirectives()],
})
