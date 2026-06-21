<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { STATS } from '~/constants/stats'

const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 350)
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')

const capabilityMeta = [
  {
    icon: 'i-lucide-library',
    description: 'Koleksi bisa ditemukan tanpa menelusuri rak secara manual.'
  },
  {
    icon: 'i-lucide-handshake',
    description: 'Alur pengajuan tetap terhubung dengan buku fisik.'
  },
  {
    icon: 'i-lucide-file-text',
    description: 'Bacaan digital dibuka dalam viewer internal yang terkontrol.'
  },
  {
    icon: 'i-lucide-bot',
    description: 'Pertanyaan anggota dijawab dengan konteks dan marker sitasi.'
  }
]
</script>

<template>
  <section
    id="highlight"
    v-motion
    class="landing-section-compact"
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
  >
    <UPageSection
      title="Fondasi layanan perpustakaan modern"
      description="Sorotan ini berupa kapabilitas produk, bukan angka klaim yang belum terhubung ke data operasional."
      class="py-0"
    >
      <UPageGrid class="gap-4 sm:gap-5 lg:gap-6">
        <UCard
          v-for="(stat, index) in STATS"
          :key="stat.label"
          v-motion
          :initial="{ opacity: 0, y: 14 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : index * 60, ease: 'easeOut' } }"
          class="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-xl hover:shadow-secondary/10"
          data-cursor="card"
        >
          <div class="flex size-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-transform duration-300 group-hover:scale-105">
            <UIcon
              :name="capabilityMeta[index]?.icon ?? 'i-lucide-sparkles'"
              class="size-5"
            />
          </div>

          <p class="mt-4 font-semibold text-highlighted">
            {{ stat.label }}
          </p>

          <p class="mt-2 text-sm leading-6 text-muted">
            {{ capabilityMeta[index]?.description }}
          </p>
        </UCard>
      </UPageGrid>
    </UPageSection>
  </section>
</template>
