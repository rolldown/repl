import { initUrlState } from '~/state/url'

export default defineNuxtPlugin({
  hooks: {
    'app:beforeMount': () => {
      initUrlState()
    },
  },
})
