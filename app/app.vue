<script setup lang="ts">
import { openFreshRepl, urlStateError } from './state/url-error'

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
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/rolldown-bracketless.svg' },
  ],
})
</script>

<template>
  <ClientOnly>
    <Suspense>
      <main flex="~ col" bg-base text-base lg:h-screen>
        <div
          v-if="urlStateError"
          flex="~ col"
          min-h-screen
          items-center
          justify-center
          px4
          py8
        >
          <div
            flex="~ col"
            max-w-120
            items-center
            gap4
            border
            border-base
            rounded-3
            bg-soft
            px6
            py8
            text-center
            shadow-sm
          >
            <img src="/rolldown-bracketless.svg" h10 w10 alt="Rolldown" />
            <div flex="~ col" gap2>
              <p text-sm text-secondary>Unable to load this REPL</p>
              <h1 text-2xl font-700>Malformed Rolldown REPL URL</h1>
              <p text-sm text-secondary>{{ urlStateError }}</p>
            </div>

            <button
              bg-primary
              rounded-2
              px4
              py2
              text-sm
              text-white
              font-600
              transition-opacity
              hover:opacity-90
              @click="openFreshRepl"
            >
              Open fresh REPL
            </button>
          </div>
        </div>

        <template v-else>
          <Navbar />
          <div min-h-0 flex flex-1 flex-col lg:flex-row>
            <InputContainer min-w-0 flex-1 />
            <div class="panel-divider" />
            <OutputView min-w-0 flex-1 />
          </div>
        </template>
      </main>

      <template #fallback>
        <div h-100vh>
          <Loading />
        </div>
      </template>
    </Suspense>
  </ClientOnly>
</template>

<style scoped>
.panel-divider {
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .panel-divider {
    width: 1px;
    background: var(--c-border);
  }
}

@media (max-width: 1023px) {
  .panel-divider {
    height: 1px;
    background: var(--c-border);
  }
}
</style>
