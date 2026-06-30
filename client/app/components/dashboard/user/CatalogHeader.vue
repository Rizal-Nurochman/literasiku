<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 450)
</script>

<template>
  <div class="relative isolate overflow-hidden">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,var(--ui-primary)/0.14,transparent_30%),radial-gradient(circle_at_82%_10%,var(--ui-secondary)/0.12,transparent_28%),linear-gradient(180deg,var(--ui-bg),var(--ui-bg-muted))]"
    />

    <div
      aria-hidden="true"
      class="bg-grid-soft pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-30"
    />

    <UPageSection
      v-motion
      :initial="{ opacity: 0, y: 28 }"
      :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
      title="Cari Koleksi Buku Literasiku"
      description="Temukan buku fisik dan digital, cek ketersediaan, lalu lanjutkan membaca atau mengajukan peminjaman."
      :ui="{ root: 'pt-0', header: 'mb-4' }"
    >
      <template #headline>
        <UBadge
          color="primary"
          variant="subtle"
          icon="i-lucide-library"
          label="Katalog Digital"
        />
      </template>
    </UPageSection>
  </div>
</template>
