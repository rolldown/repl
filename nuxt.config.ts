const crossOriginHeaders = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

export default defineNuxtConfig({
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
    experimental: {
      enableNativePlugin: 'resolver',
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
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap',
        },
      ],
    },
  },
  css: [
    '@unocss/reset/tailwind.css',
    '~/styles/vars.css',
    '~/styles/global.css',
  ],
})
