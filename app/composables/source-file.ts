import * as monaco from 'monaco-editor'
import type { Raw } from 'vue'

export function useSourceFile(
  filename: string,
  code: string,
  isEntry?: boolean,
) {
  const { uri, model } = createModel(filename, code)
  const sourceFile: SourceFile = {
    filename,
    code,
    isEntry,
    uri,
    model,
    rename(newName: string) {
      this.filename = newName
      const { uri, model } = createModel(newName, this.code)
      this.uri = uri
      this.model.dispose()
      this.model = model
    },
    dispose() {
      this.model.dispose()
    },
    toJSON() {
      return {
        n: this.filename,
        c: this.code,
        e: this.isEntry,
      }
    },
  }
  return sourceFile
}

export function useSourceFileFromJSON(json: any) {
  return useSourceFile(json.n, json.c, json.e)
}

export interface SourceFile {
  filename: string
  code: string
  isEntry?: boolean | undefined

  uri: Raw<monaco.Uri>
  model: Raw<monaco.editor.ITextModel>

  rename: (newName: string) => void
  dispose: () => void
  toJSON: () => object
}

export type SourceFileMap = Map<string, SourceFile>

function createModel(filename: string, code: string) {
  const uri = markRaw(monaco.Uri.file(filename))
  const language = filename.endsWith('.json') ? 'json' : 'typescript'

  const existing = monaco.editor.getModel(uri)
  if (existing) {
    if (existing.getLanguageId() === language) {
      existing.setValue(code)
      return { uri, model: existing }
    } else {
      existing.dispose()
    }
  }

  const model = markRaw(monaco.editor.createModel(code, language, uri))
  return { uri, model }
}
