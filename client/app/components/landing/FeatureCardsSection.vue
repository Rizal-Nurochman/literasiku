<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { FEATURES } from '~/constants/features'

const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 400)
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')
</script>

<template>
  <section
    id="fitur"
    v-motion
    class="landing-section"
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
  >
    <UPageSection
      title="Fitur utama untuk perpustakaan digital"
      description="Literasiku menyatukan pencarian koleksi, peminjaman, pembacaan PDF, dan asisten AI dalam satu alur anggota."
      class="py-0"
    >
      <UPageGrid class="gap-4 sm:gap-5 lg:gap-6">
        <UCard
          v-for="(feature, index) in FEATURES"
          :key="feature.title"
          v-motion
          :initial="{ opacity: 0, y: 14 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : index * 60, ease: 'easeOut' } }"
          class="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
          data-cursor="card"
        >
          <div class="space-y-4">
            <div class="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-105">
              <UIcon
                :name="feature.icon"
                class="size-6"
              />
            </div>

            <div>
              <h3 class="text-lg font-semibold text-highlighted">
                {{ feature.title }}
              </h3>

              <p class="mt-2 text-sm leading-6 text-muted">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </UCard>
      </UPageGrid>
    </UPageSection>
  </section>
</template>
