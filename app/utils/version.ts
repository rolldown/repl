import { currentVersion } from '~/state/bundler'

interface VersionInfo {
  latest: string
  versions: string[]
}

export async function getRolldownVersions(): Promise<VersionInfo> {
  const response = await fetch('https://registry.npmjs.org/rolldown').then(
    (r) => r.json(),
  )
  if (!currentVersion.value) {
    currentVersion.value = response['dist-tags'].latest
  }
  return {
    latest: response['dist-tags'].latest,
    versions: Object.keys(response.versions).reverse(),
  }
}
