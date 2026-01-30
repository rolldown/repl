import { gunzipSync } from 'fflate'
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

  const arrayBuffer = await res.arrayBuffer()
  const gzipped = new Uint8Array(arrayBuffer)
  const tarData = gunzipSync(gzipped)
  const files = parseTar(tarData)

  await setCachedPackage(key, files)

  const packageJson = JSON.parse(files['package.json'] || '{}')
  return { files, packageJson }
}

const SKIP_EXTENSIONS = new Set([
  '.d.ts',
  '.d.mts',
  '.d.cts',
  '.map',
  '.md',
  '.txt',
  '.flow',
])

function shouldSkipFile(name: string): boolean {
  for (const ext of SKIP_EXTENSIONS) {
    if (name.endsWith(ext)) return true
  }
  return false
}

function parseTar(data: Uint8Array): Record<string, string> {
  const files: Record<string, string> = {}
  let offset = 0
  const decoder = new TextDecoder()

  while (offset < data.length - 512) {
    const header = data.subarray(offset, offset + 512)
    if (header.every((b) => b === 0)) break

    let name = readString(header, 0, 100)
    const prefix = readString(header, 345, 155)
    if (prefix) name = `${prefix}/${name}`

    // Strip npm tarball 'package/' prefix
    if (name.startsWith('package/')) name = name.slice(8)

    const sizeStr = readString(header, 124, 12).trim()
    const size = Number.parseInt(sizeStr, 8) || 0

    const typeFlag = header[156]

    offset += 512

    // Regular file: type '0' (0x30) or NUL (0x00)
    if (
      (typeFlag === 0 || typeFlag === 0x30) &&
      size > 0 &&
      name &&
      !shouldSkipFile(name)
    ) {
      const content = decoder.decode(data.subarray(offset, offset + size))
      files[name] = content
    }

    offset += Math.ceil(size / 512) * 512
  }

  return files
}

function readString(buf: Uint8Array, offset: number, length: number): string {
  const slice = buf.subarray(offset, offset + length)
  const nullIndex = slice.indexOf(0)
  const end = nullIndex === -1 ? length : nullIndex
  return new TextDecoder().decode(slice.subarray(0, end))
}
