<script setup lang="ts">
import DashboardUserRiwayatPhysicalHistory from '~/components/dashboard/user/riwayat/PhysicalHistory.vue'
import DashboardUserRiwayatDigitalHistory from '~/components/dashboard/user/riwayat/DigitalHistory.vue'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Riwayat Peminjaman - Literasiku',
  description: 'Kelola riwayat peminjaman fisik dan akses baca digital Anda.'
})

const items = [
  { label: 'Peminjaman Digital', icon: 'i-lucide-smartphone', slot: 'digital' },
  { label: 'Peminjaman Fisik', icon: 'i-lucide-book', slot: 'physical' }
]
</script>

<template>
  <div class="relative isolate overflow-hidden min-h-[calc(100vh-4rem)]">
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
      :visible-once="{ opacity: 1, y: 0, transition: { duration: 450, ease: 'easeOut' } }"
      title="Riwayat Peminjaman"
      description="Kelola dan pantau seluruh histori peminjaman buku fisik dan akses baca digital Anda."
      :ui="{ root: 'pt-8', header: 'mb-8' }"
    >
      <div class="max-w-5xl mx-auto mt-4">
        <UTabs :items="items" class="w-full">
          <template #digital>
            <div class="mt-6">
              <DashboardUserRiwayatDigitalHistory />
            </div>
          </template>
          <template #physical>
            <div class="mt-6">
              <DashboardUserRiwayatPhysicalHistory />
            </div>
          </template>
        </UTabs>
      </div>
    </UPageSection>
  </div>
</template>
