<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { capabilityMeta, STATS } from '~/constants/stats'

const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 350)
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')


</script>

<template>
  <section
    id="highlight"
    v-motion
    class="landing-section-compact relative overflow-hidden"
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
  >
    <UPageSection
      title="Fondasi layanan perpustakaan modern"
      description="Sorotan ini berupa kapabilitas produk, bukan angka klaim yang belum terhubung ke data operasional."
      class="py-0"
    >
      <UPageGrid class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        <UCard
          v-for="(stat, index) in STATS"
          :key="stat.label"
          v-motion
          :initial="{ opacity: 0, y: 14 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : index * 60, ease: 'easeOut' } }"
          class="group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1.5 border border-default/60 bg-elevated/40 backdrop-blur-sm hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
          data-cursor="card"
        >
          <div
            aria-hidden="true"
            class="pointer-events-none absolute -right-12 -top-12 size-24 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:size-32 group-hover:bg-primary/10"
          />

          <div class="flex flex-col h-full justify-between">
            <div>
              <div 
                :class="[
                  'flex size-12 items-center justify-center rounded-xl bg-gradient-to-br border transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg',
                  capabilityMeta[index]?.gradient ?? 'from-secondary/10 to-primary/10 text-secondary border-secondary/20'
                ]"
              >
                <UIcon
                  :name="capabilityMeta[index]?.icon ?? 'i-lucide-sparkles'"
                  class="size-5"
                />
              </div>

              <h3 class="mt-5 font-bold text-xl tracking-tight text-highlighted group-hover:text-primary transition-colors duration-300">
                {{ stat.label }}
              </h3>

              <p class="mt-2 text-sm leading-relaxed text-muted">
                {{ capabilityMeta[index]?.description }}
              </p>
            </div>
          </div>
        </UCard>
      </UPageGrid>
    </UPageSection>
  </section>
</template>