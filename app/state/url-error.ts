export const urlStateError = shallowRef<string | null>(null)

export function openFreshRepl() {
  urlStateError.value = null
  location.assign(`${location.pathname}${location.search}`)
}
