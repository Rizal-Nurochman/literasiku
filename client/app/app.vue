<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico?v=2' }
  ],
  htmlAttrs: {
    lang: 'id'
  }
})

const title = 'Literasiku - Digital Library with AI Agent'
const description = 'Literasiku adalah web library digital dengan AI Agent yang membantu pengguna mencari buku, memahami materi, dan belajar dengan cara yang lebih seru, cepat, dan interaktif.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/favicon.ico',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <AppLogo class="w-auto h-7 shrink-0" />

          <span class="text-lg font-bold tracking-tight">
            Literasiku
          </span>
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />

        <UButton
          to="/"
          label="Mulai Belajar"
          color="primary"
          variant="solid"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator icon="i-lucide-book-open" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Literasiku • Digital Library with AI Agent • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <p class="text-sm text-muted">
          Cari. Pahami. Belajar lebih seru.
        </p>
      </template>
    </UFooter>
  </UApp>
</template>