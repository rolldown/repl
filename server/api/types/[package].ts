export default eventHandler(async (evt) => {
  const packageName = getRouterParam(evt, 'package')!
  const version = getQuery(evt).version || 'latest'

  // Only allow fetching types for specific packages to prevent abuse
  const allowedPackages = ['rolldown']
  if (!allowedPackages.includes(packageName)) {
    return new Response(`Package ${packageName} is not allowed`, {
      status: 403,
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
      return new Response(
        `Failed to fetch types for ${packageName}: ${response.statusText}`,
        {
          status: response.status,
        },
      )
    }

    const types = await response.text()

    return new Response(types, {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    return new Response(`Error fetching types: ${error}`, {
      status: 500,
    })
  }
})
