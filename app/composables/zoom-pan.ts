import type { Ref } from 'vue'

const ZOOM_IN_FACTOR = 1.1
const ZOOM_OUT_FACTOR = 0.9
const ZOOM_STEP = 1.25
const MIN_SCALE = 0.1
const MAX_SCALE = 10

/**
 * Composable for zoom and pan functionality on a container element.
 * - Mouse wheel: zoom in/out centered at cursor position
 * - Mouse drag: pan the content
 * - Provides zoomIn, zoomOut, reset functions for button controls
 */
export function useZoomPan(containerRef: Ref<HTMLElement | null>) {
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)
  const isDragging = ref(false)

  let startX = 0
  let startY = 0
  let startTranslateX = 0
  let startTranslateY = 0

  const transform = computed(
    () =>
      `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  )

  function applyZoom(newScale: number, originX: number, originY: number) {
    const ratio = newScale / scale.value
    translateX.value = originX - (originX - translateX.value) * ratio
    translateY.value = originY - (originY - translateY.value) * ratio
    scale.value = newScale
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    const rect = containerRef.value?.getBoundingClientRect()
    if (!rect) return
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const factor = e.deltaY > 0 ? ZOOM_OUT_FACTOR : ZOOM_IN_FACTOR
    const newScale = Math.min(
      Math.max(scale.value * factor, MIN_SCALE),
      MAX_SCALE,
    )
    applyZoom(newScale, mouseX, mouseY)
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return
    isDragging.value = true
    startX = e.clientX
    startY = e.clientY
    startTranslateX = translateX.value
    startTranslateY = translateY.value
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging.value) return
    translateX.value = startTranslateX + (e.clientX - startX)
    translateY.value = startTranslateY + (e.clientY - startY)
  }

  function onMouseUp() {
    isDragging.value = false
  }

  function zoomIn() {
    const el = containerRef.value
    const centerX = el ? el.offsetWidth / 2 : 0
    const centerY = el ? el.offsetHeight / 2 : 0
    applyZoom(Math.min(scale.value * ZOOM_STEP, MAX_SCALE), centerX, centerY)
  }

  function zoomOut() {
    const el = containerRef.value
    const centerX = el ? el.offsetWidth / 2 : 0
    const centerY = el ? el.offsetHeight / 2 : 0
    applyZoom(Math.max(scale.value / ZOOM_STEP, MIN_SCALE), centerX, centerY)
  }

  function reset() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }

  // passive: false is required to allow preventDefault() which prevents the
  // page from scrolling when the user zooms the graph with the mouse wheel.
  useEventListener(containerRef, 'wheel', onWheel, { passive: false })
  useEventListener(document, 'mousemove', onMouseMove)
  useEventListener(document, 'mouseup', onMouseUp)

  return {
    scale,
    isDragging,
    transform,
    onMouseDown,
    zoomIn,
    zoomOut,
    reset,
  }
}
