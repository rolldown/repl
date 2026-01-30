import { files } from '~/state/bundler'
import type { InstallProgress } from '~/composables/npm/types'

export const installProgress = ref<InstallProgress>({
  status: 'idle',
  totalPackages: 0,
  downloadedPackages: 0,
  currentPackage: '',
})

export const userDependencies = computed<Record<string, string>>(() => {
  const pkgFile = files.value.get('package.json')
  if (!pkgFile) return {}

  try {
    const parsed = JSON.parse(pkgFile.code)
    return parsed.dependencies || {}
  } catch {
    return {}
  }
})

export const npmVfsFiles = shallowRef<Record<string, string>>({})
