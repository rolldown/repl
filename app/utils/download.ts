import { strToU8, zip } from 'fflate'
import { currentVersion, files } from '~/state/bundler'

export function downloadProject() {
  const projectFiles: Record<string, Uint8Array> = {}

  // Add all source files from the REPL
  for (const [filename, sourceFile] of files.value) {
    projectFiles[filename] = strToU8(sourceFile.code)
  }

  // Generate package.json with rolldown dependency
  const packageJson = {
    name: 'rolldown-repl-project',
    version: '1.0.0',
    private: true,
    packageManager: 'pnpm@10.15.0',
    type: 'module',
    scripts: {
      build: 'rolldown',
      dev: 'rolldown --watch',
    },
    dependencies: {
      rolldown:
        currentVersion.value === 'latest' ? '^1.0.0' : currentVersion.value,
    },
  }

  projectFiles['package.json'] = strToU8(JSON.stringify(packageJson, null, 2))

  // Create zip file
  return new Promise<Uint8Array>((resolve, reject) => {
    zip(projectFiles, { level: 6 }, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

export function triggerDownload(data: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(data)], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export function handleDownloadProject() {
  try {
    downloadProject()
      .then((zipData) => {
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replaceAll(':', '-')
        triggerDownload(zipData, `rolldown-repl-${timestamp}.zip`)
      })
      .catch((error) => {
        console.error('Failed to download project:', error)
        // eslint-disable-next-line no-alert
        alert('Failed to download project. Please try again.')
      })
  } catch (error) {
    console.error('Failed to download project:', error)
    // eslint-disable-next-line no-alert
    alert('Failed to download project. Please try again.')
  }
}
