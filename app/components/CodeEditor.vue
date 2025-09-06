<script lang="ts" setup>
import * as monaco from 'monaco-editor'
import {
  AutoTypings,
  JsDelivrSourceResolver,
  LocalStorageCache,
} from 'monaco-editor-auto-typings'
import type { MonacoLanguage } from '~/composables/source-file'

const modelValue = defineModel<string>({ default: '' })
const props = withDefaults(
  defineProps<{
    language?: MonacoLanguage
    options?: monaco.editor.IStandaloneEditorConstructionOptions
    model?: monaco.editor.ITextModel
    readonly?: boolean
  }>(),
  {
    language: () => 'plaintext',
    options: () => ({}),
  },
)

const isLoading = ref(true)
const editorRef = shallowRef<monaco.editor.IStandaloneCodeEditor>()
const editorElement = useTemplateRef<HTMLDivElement>('editorElement')

let editor: monaco.editor.IStandaloneCodeEditor

const options = computed(() => ({
  ...getSharedMonacoOptions(),
  fontSize: 13,
  fontLigatures: true,
  readOnly: props.readonly,
  ...props.options,
}))
watch(options, () => editor?.updateOptions(options.value))

watch(modelValue, () => {
  if (
    model.value.getValue() !== modelValue.value &&
    !model.value.isDisposed()
  ) {
    model.value.setValue(modelValue.value)
  }
})

const model = computedWithControl(
  () => [props.model, props.language],
  () => {
    return (
      props.model ||
      markRaw(monaco.editor.createModel(modelValue.value, props.language))
    )
  },
)
watch(model, () => {
  editor?.setModel(model.value)
  modelValue.value = model.value.getValue()
})

watch(editorElement, (newValue, oldValue) => {
  if (!newValue || oldValue) return

  editor = monaco.editor.create(newValue, options.value)
  editorRef.value = editor
  editor.layout()
  editor.setModel(model.value)
  editor.onDidChangeModelContent(() => {
    modelValue.value = editor.getValue()
  })
  isLoading.value = false
  if (!props.readonly) {
    const resolver = new JsDelivrSourceResolver()
    const original = resolver.resolveSourceFile
    resolver.resolveSourceFile = function (packageName, version, filePath) {
      filePath = filePath
        .replaceAll('.d.cts.d.ts', '.d.cts')
        .replaceAll('.cjs.d.ts', '.d.cts')
      return original.call(this, packageName, version, filePath)
    }
    AutoTypings.create(editor, {
      sourceCache: new LocalStorageCache(),
      fileRootPath: props.model ? monaco.Uri.file('/').path : undefined,
      sourceResolver: resolver,
    })
  }
})

defineExpose({
  /**
   * Monaco editor instance
   */
  $editor: editorRef,
})
</script>

<template>
  <div ref="editorElement">
    <Loading v-if="isLoading" />
  </div>
</template>
