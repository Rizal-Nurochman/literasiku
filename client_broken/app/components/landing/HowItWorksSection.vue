<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { HOW_IT_WORKS_STEPS } from '~/constants/how-it-works'

const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 450)
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')
const items = HOW_IT_WORKS_STEPS.map((step, index) => ({
  ...step,
  value: index + 1
}))
</script>

<template>
  <section
    id="cara-kerja"
    v-motion
    class="landing-section"
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
  >
    <UPageSection
      title="Cara kerja dari katalog sampai membaca"
      description="Alurnya mengikuti kebutuhan nyata anggota perpustakaan, dari login sampai memahami isi buku."
      class="w-full py-0"
    >
      <div
        v-motion
        class="relative overflow-hidden rounded-3xl border border-default/70 bg-default/80 p-5 shadow-xl shadow-primary/5 backdrop-blur sm:p-6"
        :initial="{ opacity: 0, y: 18 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : 120, ease: 'easeOut' } }"
      >
        <div
          aria-hidden="true"
          class="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-secondary/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          class="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-primary/10 blur-3xl"
        />

        <div class="relative z-10">
          <UBadge
            color="primary"
            variant="subtle"
            icon="i-lucide-route"
            label="Workflow Anggota"
            class="mb-4"
          />

          <p class="mb-8 max-w-2xl text-sm leading-6 text-muted">
            Dari mencari buku sampai bertanya ke AI, semua alur dibuat berurutan agar pengalaman anggota lebih mudah dipahami.
          </p>

          <div class="relative hidden lg:block">
            <div class="absolute left-0 right-0 top-8 h-0.5 rounded-full bg-muted" />

            <div
              v-motion
              class="absolute left-0 right-0 top-8 h-0.5 origin-left rounded-full bg-gradient-to-r from-primary via-secondary to-cyan-400 shadow-lg shadow-primary/30"
              :initial="{ scaleX: shouldReduceMotion ? 1 : 0 }"
              :visible-once="{ scaleX: 1, transition: { duration: shouldReduceMotion ? 0 : 1200, ease: 'easeOut' } }"
            />

            <div class="relative grid grid-cols-5 gap-4 xl:gap-5">
              <div
                v-for="(item, index) in items"
                :key="item.title"
                v-motion
                class="relative text-center"
                :initial="{ opacity: 0, y: 16, scale: 0.96 }"
                :visible-once="{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration,
                    delay: shouldReduceMotion ? 0 : 180 + index * 180,
                    ease: 'easeOut'
                  }
                }"
              >
                <div class="relative z-10 mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary text-inverted shadow-lg shadow-primary/20 ring-8 ring-primary/10 transition-transform duration-300 hover:scale-105">
                  <UIcon
                    :name="item.icon"
                    class="size-6"
                  />
                </div>

                <UBadge
                  color="primary"
                  variant="subtle"
                  :label="`Step ${item.value}`"
                  class="mb-3"
                />

                <h3 class="text-base font-semibold text-highlighted">
                  {{ item.title }}
                </h3>

                <p class="mt-2 text-sm leading-6 text-muted">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>

          <div class="relative space-y-6 lg:hidden">
            <div class="absolute left-6 top-0 h-full w-0.5 rounded-full bg-muted" />

            <div
              v-motion
              class="absolute left-6 top-0 h-full w-0.5 origin-top rounded-full bg-gradient-to-b from-primary via-secondary to-cyan-400 shadow-lg shadow-primary/30"
              :initial="{ scaleY: shouldReduceMotion ? 1 : 0 }"
              :visible-once="{ scaleY: 1, transition: { duration: shouldReduceMotion ? 0 : 1200, ease: 'easeOut' } }"
            />

            <div
              v-for="(item, index) in items"
              :key="item.title"
              v-motion
              class="relative flex gap-4"
              :initial="{ opacity: 0, x: -16 }"
              :visible-once="{
                opacity: 1,
                x: 0,
                transition: {
                  duration,
                  delay: shouldReduceMotion ? 0 : 180 + index * 160,
                  ease: 'easeOut'
                }
              }"
            >
              <div class="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary text-inverted shadow-lg shadow-primary/20 ring-4 ring-primary/10">
                <UIcon
                  :name="item.icon"
                  class="size-5"
                />
              </div>

              <div class="rounded-2xl border border-default/70 bg-default/70 p-4 shadow-sm backdrop-blur">
                <UBadge
                  color="primary"
                  variant="subtle"
                  :label="`Step ${item.value}`"
                  class="mb-3"
                />

                <h3 class="font-semibold text-highlighted">
                  {{ item.title }}
                </h3>

                <p class="mt-2 text-sm leading-6 text-muted">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UPageSection>
  </section>
</template>
