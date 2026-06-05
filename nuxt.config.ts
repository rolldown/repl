import process from 'node:process'
import { fileURLToPath } from 'node:url'

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
  },
  nitro: {
    routeRules: {
      '/**': {
        headers: crossOriginHeaders,
      },
    },
  },
  // Cloudflare/Void build: >= 2024-09-19 makes Nitro emit its modern
  // static-assets worker (env.ASSETS). Below that it falls back to the legacy
  // Workers Sites worker (__STATIC_CONTENT_MANIFEST), which Void can't run.
  // Netlify stays at 2024-04-03 so it keeps using functions v1 (v2 is gated at
  // 2024-05-07), leaving the existing Netlify deploy untouched.
  compatibilityDate: process.env.NITRO_PRESET?.includes('cloudflare')
    ? '2024-09-19'
    : '2024-04-03',
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
  runtimeConfig: {
    public: {
      // set to `true` to use local rolldown build for development
      useLocalRolldown: !!process.env.VITE_USE_LOCAL_ROLLDOWN,
    },
  },
  css: [
    '@unocss/reset/tailwind.css',
    '~/styles/vars.css',
    '~/styles/global.css',
  ],
})
