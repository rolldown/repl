const crossOriginHeaders = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  modules: [
    '@unocss/nuxt',
    '@vueuse/nuxt',
    'nuxt-monaco-editor',
    '@nuxtjs/plausible',
  ],
  plausible: {
    domain: 'repl.rolldown.rs',
    apiHost: 'https://evt.sxzz.dev',
  },
  vite: {
    resolve: {
      alias: {
        path: 'pathe',
      },
    },
    build: {
      target: 'esnext',
    },
    server: {
      headers: crossOriginHeaders,
    },
  },
  nitro: {
    routeRules: {
      '/**': {
        headers: crossOriginHeaders,
      },
    },
  },
  compatibilityDate: '2024-04-03',
  devtools: {
    enabled: false,
  },
  css: [
    '@unocss/reset/tailwind.css',
    '~/styles/vars.css',
    '~/styles/global.css',
  ],
})
