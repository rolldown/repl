import { defineConfig } from 'void/config'

export default defineConfig({
  inference: {
    build: 'NITRO_PRESET=cloudflare-module nuxt build',
  },
  routing: {
    headers: {
      '/*': [
        'Cross-Origin-Embedder-Policy: require-corp',
        'Cross-Origin-Opener-Policy: same-origin',
      ],
    },
  },
  worker: {
    compatibility_date: '2026-02-24',
    compatibility_flags: ['nodejs_compat', 'nodejs_als'],
  },
})
