export default eventHandler(async (evt) => {
  const packageName = getRouterParam(evt, 'package')!
  const version = getQuery(evt).version || 'latest'

  // Only allow fetching types for specific packages to prevent abuse
  const allowedPackages = ['rolldown']
  if (!allowedPackages.includes(packageName)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Package ${packageName} is not allowed`,
    })
  }

  // Validate version format to prevent path traversal
  if (
    typeof version === 'string' &&
    /[./\\]/.test(version.replaceAll(/[0-9.a-z-]/gi, ''))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid version format',
    })
  }

  const url = `https://cdn.jsdelivr.net/npm/${packageName}@${version}/dist/index.d.mts`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Rolldown REPL Type Fetcher',
        Accept: 'text/plain, */*',
      },
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch types for ${packageName}: ${response.statusText}`,
      })
    }

    const types = await response.text()

    setResponseHeaders(evt, {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    })

    return types
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error fetching types: ${error}`,
    })
  }
})
