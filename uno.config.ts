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
    'bg-soft': 'bg-$c-bg-soft',
    'bg-mute': 'bg-$c-bg-mute',
    'bg-glass': 'bg-white:75 dark:bg-#111:75 backdrop-blur-5',

    'text-base': 'text-$c-text-base',
    'text-secondary': 'text-$c-text-secondary',

    'flex-center': 'items-center justify-center',
    'flex-x-center': 'justify-center',
    'flex-y-center': 'items-center',

    'nav-button':
      'flex flex-center rounded-md p1.5 text-$c-text-secondary hover:text-$c-text-base hover:bg-$c-bg-mute active:scale-95 transition-all duration-150',

    'nav-divider': 'w-px h-5 bg-$c-border mx1',

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
