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
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/lightning-down.svg' }],
})
</script>

<template>
  <Suspense>
    <main flex="~ col" lg:h-screen>
      <ClientOnly>
        <Navbar />
        <div min-h-0 flex flex-1 flex-col gap4 lg:flex-row>
          <InputContainer min-w-0 flex-1 />
          <OutputContainer min-w-0 flex-1 />
        </div>
        <template #fallback>
          <Loading />
        </template>
      </ClientOnly>
    </main>
  </Suspense>
</template>
