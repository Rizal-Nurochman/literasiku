<script setup lang="ts">
import AppFooter from '~/components/layout/AppFooter.vue'
import AppNavbar from '~/components/layout/AppNavbar.vue'
</script>

<template>
  <div>
    <AppNavbar />

    <UMain>
      <slot />
    </UMain>

    <USeparator icon="i-lucide-book-open" />

    <AppFooter />
  </div>
</template>
