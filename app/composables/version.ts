interface VersionInfo {
  latest: string
  versions: string[]
}

export async function getRolldownVersions(): Promise<VersionInfo> {
  const response = await fetch('https://registry.npmjs.org/rolldown').then(
    (r) => r.json(),
  )
  return {
    latest: response['dist-tags'].latest,
    versions: Object.keys(response.versions).toReversed(),
  }
}

export function useRolldownVersions() {
  return useAsyncData('rolldown-versions', getRolldownVersions)
}
