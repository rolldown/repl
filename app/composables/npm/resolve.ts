const versionCache = new Map<string, string>()

export async function resolveVersion(
  name: string,
  specifier: string,
): Promise<string> {
  if (/^\d+\.\d+\.\d+$/.test(specifier)) {
    return specifier
  }

  const key = `${name}@${specifier}`
  const cached = versionCache.get(key)
  if (cached) return cached

  const url = `https://data.jsdelivr.com/v1/packages/npm/${name}/resolved?specifier=${encodeURIComponent(specifier)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to resolve ${key}: ${res.statusText}`)

  const data = await res.json()
  if (!data.version) throw new Error(`No version found for ${key}`)

  versionCache.set(key, data.version)
  return data.version
}
