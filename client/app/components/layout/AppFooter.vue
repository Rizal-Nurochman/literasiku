<script setup lang="ts">
import { FOOTER_LINKS } from '~/constants/footer'

const columns = FOOTER_LINKS.map(column => ({
  label: column.label,
  children: column.items
}))
</script>

<template>
  <UFooter>
    <template #top>
      <UFooterColumns :columns="columns" />
    </template>

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
</template>
