export const codeTemplate = 'export const foo = 42'
export const configTemplate = `import type { RolldownOptions } from 'rolldown'
const config: RolldownOptions = {\n\n}

export default config`

export const DEFAULT_ENTRY = 'index.ts'
export const CONFIG_FILES = ['rolldown.config.ts', 'rolldown.config.js']

export const defaultFiles = () => {
  return new Map([
    [DEFAULT_ENTRY, useSourceFile(DEFAULT_ENTRY, codeTemplate, true)],
    [CONFIG_FILES[0]!, useSourceFile(CONFIG_FILES[0]!, configTemplate)],
  ])
}

export const files = ref<SourceFileMap>(defaultFiles())
export const activeFile = ref<string>()
export const timeCost = ref<number>()

export const currentVersion = ref<string>('latest')
