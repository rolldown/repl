export async function getRolldownVersions(): Promise<string[]> {
  const response = await fetch('https://registry.npmjs.org/rolldown').then(
    (r) => r.json(),
  )
  return Object.keys(response.versions).reverse()
}
