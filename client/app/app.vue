<script setup lang="ts">
import AppCursor from '~/components/common/AppCursor.vue'

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
    <AppCursor />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
