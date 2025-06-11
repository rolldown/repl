export const codeTemplate = 'export const foo = 42'
export const configTemplate = `export default {\n\n}`

export const DEFAULT_ENTRY = 'index.ts'
export const CONFIG_FILE = 'rolldown.config.js'

export const defaultFiles = () => {
  return new Map([
    [DEFAULT_ENTRY, useSourceFile(DEFAULT_ENTRY, codeTemplate, true)],
    [CONFIG_FILE, useSourceFile(CONFIG_FILE, configTemplate)],
  ])
}

export const files = ref<SourceFileMap>(defaultFiles())
export const activeFile = ref<string>()
export const timeCost = ref<number>()

export const currentVersion = ref<string>('nightly')
