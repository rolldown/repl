import type { TransformResult } from '~/composables/bundler'

export const bundlerOutput = ref<TransformResult | undefined>()
export const bundlerStatus = ref<'idle' | 'pending' | 'error' | 'success'>(
  'idle',
)
export const bundlerError = ref<Error | null | undefined>(null)
