import { greaterOrEqual, parse } from 'std-semver'

interface VersionInfo {
  latest: string
  versions: string[]
}

export async function getRolldownVersions(): Promise<VersionInfo> {
  const response = await fetch('https://registry.npmjs.org/rolldown').then(
    (r) => r.json(),
  )
  const versions = Object.keys(response.versions)
    .toReversed()
    .filter((v) =>
      greaterOrEqual(parse(v), {
        major: 1,
        minor: 0,
        patch: 0,
        prerelease: ['rc'],
      }),
    )
  return {
    latest: response['dist-tags'].latest,
    versions,
  }
}

export function useRolldownVersions() {
  return useAsyncData('rolldown-versions', getRolldownVersions)
}
