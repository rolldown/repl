import { getCachedPackage, setCachedPackage } from './cache'

export async function downloadAndExtract(
  name: string,
  version: string,
): Promise<{ files: Record<string, string>; packageJson: any }> {
  const key = `${name}@${version}`

  const cached = await getCachedPackage(key)
  if (cached) {
    return {
      files: cached,
      packageJson: JSON.parse(cached['package.json'] || '{}'),
    }
  }

  const shortName = name.startsWith('@') ? name.split('/')[1] : name
  const tarballUrl = `https://registry.npmjs.org/${name}/-/${shortName}-${version}.tgz`

  const res = await fetch(tarballUrl)
  if (!res.ok) throw new Error(`Failed to download ${key}: ${res.statusText}`)
  if (!res.body) throw new Error(`No response body for ${key}`)

  const { createGzipDecoder, unpackTar } = await import('modern-tar')
  const entries = await unpackTar(res.body.pipeThrough(createGzipDecoder()))

  const decoder = new TextDecoder()
  const files: Record<string, string> = {}

  for (const entry of entries) {
    let fileName = entry.header.name
    if (fileName.startsWith('package/')) fileName = fileName.slice(8)
    if (entry.header.type === 'directory' || !fileName) continue
    files[fileName] = decoder.decode(entry.data)
  }

  await setCachedPackage(key, files)

  const packageJson = JSON.parse(files['package.json'] || '{}')
  return { files, packageJson }
}
