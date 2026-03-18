import process from 'node:process'
import { fileURLToPath } from 'node:url'

const crossOriginHeaders = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

process.env.VITE_USE_LOCAL_ROLLDOWN = '' // set to `1` to use local rolldown build for development

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
        '@rolldown/browser/rolldown-binding-wasi': fileURLToPath(
          new URL(
            'rolldown-binding.wasi-browser.js',
            import.meta.resolve('@rolldown/browser'),
          ),
        ),
      },
    },
    optimizeDeps: {
      exclude: ['@rolldown/browser'],
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
