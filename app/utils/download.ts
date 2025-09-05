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
    type: 'module',
    scripts: {
      build: 'rolldown',
      dev: 'rolldown --watch',
    },
    dependencies: {
      rolldown: currentVersion.value.startsWith('git@')
        ? `https://pkg.pr.new/rolldown@${currentVersion.value.slice(4)}`
        : currentVersion.value,
    },
  }

  projectFiles['package.json'] = strToU8(
    `${JSON.stringify(packageJson, null, 2)}\n`,
  )

  // Create zip file
  return new Promise<Uint8Array>((resolve, reject) => {
    zip(projectFiles, { level: 6 }, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

function triggerDownload(data: Uint8Array, filename: string) {
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

export async function handleDownloadProject() {
  try {
    const zipData = await downloadProject()
    const timestamp = new Date().toISOString().slice(0, 19).replaceAll(':', '-')
    triggerDownload(zipData, `rolldown-repl-${timestamp}.zip`)
  } catch (error) {
    console.error('Failed to download project:', error)
    // eslint-disable-next-line no-alert
    alert('Failed to download project. Please try again.')
  }
}
