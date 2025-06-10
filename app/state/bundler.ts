export const codeTemplate = 'export const foo = 42'
export const configTemplate = `export default {\n\n}`

export const DEFAULT_ENTRY = 'index.ts'
export const defaultFiles = () => {
  const files = new Map([
    [DEFAULT_ENTRY, useSourceFile(DEFAULT_ENTRY, codeTemplate, true)],
  ])

  const configFile = rolldown.configFile
  if (configFile) {
    files.set(configFile, useSourceFile(configFile, configTemplate))
  }
  return files
}

export const files = ref<SourceFileMap>(defaultFiles())
export const activeFile = ref<string>()
export const timeCost = ref<number>()
