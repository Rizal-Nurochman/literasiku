<script setup lang="ts">
import AppFooter from '~/components/layout/AppFooter.vue'
import AppNavbar from '~/components/layout/AppNavbar.vue'

const route = useRoute()
const isLandingPage = computed(() => route.path === '/')
</script>

<template>
  <div>
    <AppNavbar v-if="isLandingPage" />

    <UMain>
      <slot />
    </UMain>

    <USeparator v-if="isLandingPage" icon="i-lucide-book-open" />

    <AppFooter v-if="isLandingPage" />
  </div>
</template>