<script setup lang="ts">
const title = 'Rolldown REPL'
const desc = 'Rolldown REPL'
const url = 'https://repl.rolldown.rs/'

useSeoMeta({
  title,
  description: desc,
  ogTitle: title,
  ogDescription: desc,
  ogUrl: url,
  twitterTitle: title,
  twitterDescription: desc,
})

useHeadSafe({
  title: 'Rolldown REPL',
  htmlAttrs: {
    lang: 'en',
  },
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/rolldown-bracketless.svg' }],
})
</script>

<template>
  <ClientOnly>
    <Suspense>
      <main flex="~ col" lg:h-screen>
        <Navbar />
        <div min-h-0 flex flex-1 flex-col gap4 lg:flex-row>
          <InputContainer min-w-0 flex-1 />
          <OutputContainer min-w-0 flex-1 />
        </div>
      </main>

      <template #fallback>
        <div h-100vh>
          <Loading />
        </div>
      </template>
    </Suspense>
  </ClientOnly>
</template>
