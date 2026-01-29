import type * as monaco from 'monaco-editor'

/**
 * Fetches and adds type definitions for a package via our proxy API
 */
export async function addPackageTypes(
  monacoInstance: typeof monaco,
  packageName: string,
  version: string = 'latest',
): Promise<void> {
  try {
    // Fetch types through our proxy API to avoid CORS issues
    const response = await fetch(
      `/api/types/${packageName}?version=${version}`,
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch types for ${packageName}: ${response.statusText}`,
      )
      return
    }

    const types = await response.text()

    // Add the types to Monaco's TypeScript environment
    monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(
      types,
      `file:///node_modules/@types/${packageName}/index.d.ts`,
    )

    console.log(`Successfully loaded types for ${packageName}`)
  } catch (error) {
    console.warn(`Error loading types for ${packageName}:`, error)
  }
}

/**
 * Load types for the rolldown package
 */
export async function loadRolldownTypes(
  monacoInstance: typeof monaco,
): Promise<void> {
  await addPackageTypes(monacoInstance, 'rolldown', '1.0.0-rc.2')
}
