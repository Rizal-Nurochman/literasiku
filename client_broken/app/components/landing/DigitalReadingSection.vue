<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 450)
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')
</script>

<template>
  <section
    id="baca-digital"
    v-motion
    class="landing-section"
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
  >
    <UPageSection
      title="Baca PDF dan tanya AI dengan sitasi"
      description="Jawaban chatbot membawa marker referensi sehingga anggota bisa kembali ke bagian bacaan yang relevan."
      class="w-full py-0"
    >
      <div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <UCard
          v-motion
          :initial="{ opacity: 0, x: -20 }"
          :visible-once="{ opacity: 1, x: 0, transition: { duration, ease: 'easeOut' } }"
          class="flex-1 overflow-hidden border-default/80 bg-default/90 shadow-xl shadow-primary/5"
        >
          <div class="flex h-full flex-col space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-default pb-4">
              <div class="flex items-center gap-2">
                <UButton
                  icon="i-lucide-zoom-out"
                  color="neutral"
                  variant="ghost"
                  square
                  disabled
                  aria-label="Perkecil halaman"
                  data-cursor="disabled"
                />

                <UBadge
                  color="neutral"
                  variant="soft"
                  label="Halaman 18"
                />

                <UButton
                  icon="i-lucide-zoom-in"
                  color="neutral"
                  variant="ghost"
                  square
                  disabled
                  aria-label="Perbesar halaman"
                  data-cursor="disabled"
                />
              </div>

              <div class="flex items-center gap-2">
                <UBadge
                  color="neutral"
                  variant="soft"
                  label="72%"
                />

                <UBadge
                  color="info"
                  variant="subtle"
                  label="Digital Tersedia"
                />
              </div>
            </div>

            <div class="flex flex-1 flex-col justify-center space-y-3 rounded-xl border border-default bg-muted/40 p-4 sm:p-5">
              <div class="h-3 w-full rounded-full bg-primary/20" />
              <div class="h-3 w-10/12 rounded-full bg-primary/15" />
              <div class="h-3 w-11/12 rounded-full bg-secondary/20" />
              <div class="h-3 w-8/12 rounded-full bg-primary/10" />

              <div class="my-4 rounded-xl border border-primary/20 bg-default p-4 shadow-sm">
                <div class="mb-3 flex items-center gap-2">
                  <UBadge
                    color="primary"
                    variant="subtle"
                    label="Highlight"
                  />

                  <span class="text-xs text-muted">Paragraf terkait</span>
                </div>

                <p class="text-sm leading-6 text-muted">
                  Literasi digital menuntut pembaca memeriksa sumber, memahami konteks, dan menghubungkan gagasan antarbagian sebelum membuat kesimpulan.
                </p>
              </div>

              <div class="h-3 w-9/12 rounded-full bg-secondary/15" />
              <div class="h-3 w-11/12 rounded-full bg-primary/15" />
            </div>
          </div>
        </UCard>

        <UCard
          v-motion
          :initial="{ opacity: 0, x: 20 }"
          :visible-once="{ opacity: 1, x: 0, transition: { duration, delay: shouldReduceMotion ? 0 : 100, ease: 'easeOut' } }"
          class="flex-1 overflow-hidden border-secondary/30 bg-gradient-to-br from-secondary/10 via-default to-primary/10 shadow-xl shadow-secondary/10"
        >
          <div class="flex h-full flex-col justify-between space-y-4">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <UAvatar
                  icon="i-lucide-bot"
                  size="sm"
                />

                <div>
                  <h3 class="font-semibold text-highlighted">
                    Chatbot Pembaca Buku
                  </h3>

                  <p class="text-sm text-muted">
                    Fokus pada isi PDF yang sedang dibaca.
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="ml-auto max-w-[82%] rounded-lg bg-primary px-4 py-3 text-sm text-inverted">
                  Jelaskan inti paragraf ini dengan bahasa sederhana.
                </div>

                <div class="max-w-[88%] rounded-lg bg-muted px-4 py-3 text-sm text-highlighted">
                  Intinya, pembaca perlu mengecek sumber dan mengaitkan informasi sebelum membuat kesimpulan.

                  <UTooltip text="Kutipan: pembaca memeriksa sumber, memahami konteks, dan menghubungkan gagasan antarbagian.">
                    <UBadge
                      color="info"
                      variant="soft"
                      label="S1"
                      size="xs"
                      class="ml-1 cursor-help"
                    />
                  </UTooltip>
                </div>

                <div class="flex max-w-[88%] items-center gap-2 rounded-lg bg-muted/70 px-4 py-3">
                  <span class="size-2 rounded-full bg-primary/70" />
                  <span class="size-2 rounded-full bg-primary/50" />
                  <span class="size-2 rounded-full bg-primary/30" />
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="rounded-xl border border-default/60 bg-default/60 p-3 sm:p-4">
                <p class="text-sm text-muted">
                  AI membantu anggota memahami bacaan tanpa keluar dari halaman PDF, lengkap dengan marker sitasi agar sumber tetap bisa dicek ulang.
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge
                  color="neutral"
                  variant="subtle"
                  label="PDF Viewer Internal"
                />

                <UBadge
                  color="neutral"
                  variant="subtle"
                  label="Akses Terbatas"
                />

                <UBadge
                  color="neutral"
                  variant="subtle"
                  label="Tidak Bisa Download Langsung"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </UPageSection>
  </section>
</template>
