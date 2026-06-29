<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { BOOKS_PREVIEW, CATALOG_FILTERS } from '~/constants/catalog'

definePageMeta({
    layout:'dashboard'
 })

useSeoMeta({
  title: 'Katalog Buku - Literasiku',
  description: 'Cari koleksi buku fisik dan digital di Literasiku.'
})

const route = useRoute()
const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 450)
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const selectedCategory = ref('Semua')
const selectedAvailability = ref('Semua')

const availabilityFilters = [
  'Semua',
  'Fisik Tersedia',
  'Digital Tersedia'
]

const filteredBooks = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()

  return BOOKS_PREVIEW.filter((book) => {
    const matchesQuery = !normalizedQuery || book.title.toLowerCase().includes(normalizedQuery) || book.category.toLowerCase().includes(normalizedQuery)
    const matchesCategory = selectedCategory.value === 'Semua' || book.category === selectedCategory.value
    const matchesAvailability = selectedAvailability.value === 'Semua' || (selectedAvailability.value === 'Fisik Tersedia' && book.physicalAvailable) || (selectedAvailability.value === 'Digital Tersedia' && book.digitalAvailable)

    return matchesQuery && matchesCategory && matchesAvailability
  })
})
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
      class="min-h-[calc(100vh-4rem)]"
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

      <div class="space-y-8">
        <UCard
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : 90, ease: 'easeOut' } }"
          class="border-default/80 bg-default/80 shadow-xl shadow-primary/5 backdrop-blur"
        >
          <div class="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div class="space-y-3">
              <UInput
                v-model="query"
                icon="i-lucide-search"
                size="xl"
                placeholder="Cari judul buku, kategori, atau topik..."
                data-cursor="search"
              />

              <p class="text-sm text-muted">
                Menampilkan {{ filteredBooks.length }} koleksi dari preview katalog Literasiku.
              </p>
            </div>

            <div class="grid gap-3 lg:min-w-72">
              <div>
                <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Kategori
                </p>

                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="category in CATALOG_FILTERS"
                    :key="category"
                    :label="category"
                    :variant="selectedCategory === category ? 'solid' : 'soft'"
                    :color="selectedCategory === category ? 'primary' : 'neutral'"
                    size="sm"
                    data-cursor="button"
                    @click="selectedCategory = category"
                  />
                </div>
              </div>

              <div>
                <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Status
                </p>

                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="availability in availabilityFilters"
                    :key="availability"
                    :label="availability"
                    :variant="selectedAvailability === availability ? 'solid' : 'soft'"
                    :color="selectedAvailability === availability ? 'primary' : 'neutral'"
                    size="sm"
                    data-cursor="button"
                    @click="selectedAvailability = availability"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UPageGrid v-if="filteredBooks.length">
          <UCard
            v-for="(book, index) in filteredBooks"
            :key="book.id"
            v-motion
            :initial="{ opacity: 0, y: 18 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : index * 70, ease: 'easeOut' } }"
            class="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            data-cursor="card"
          >
            <div class="space-y-5">
              <div class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-default to-secondary/20">
                <div class="absolute inset-0 bg-grid-soft opacity-50" />

                <div class="relative flex size-20 items-center justify-center rounded-2xl bg-default/85 text-primary shadow-lg backdrop-blur transition-transform duration-300 group-hover:scale-105">
                  <UIcon
                    name="i-lucide-book-marked"
                    class="size-9"
                  />
                </div>

                <UBadge
                  class="absolute left-3 top-3"
                  color="neutral"
                  variant="soft"
                  :label="book.category"
                />
              </div>

              <div>
                <h2 class="text-lg font-semibold text-highlighted">
                  {{ book.title }}
                </h2>

                <p class="mt-2 text-sm leading-6 text-muted">
                  Koleksi {{ book.category.toLowerCase() }} untuk pembelajaran anggota, tersedia sesuai status katalog.
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-if="book.physicalAvailable"
                  color="success"
                  variant="subtle"
                  label="Fisik Tersedia"
                />

                <UBadge
                  v-if="book.digitalAvailable"
                  color="info"
                  variant="subtle"
                  label="Digital Tersedia"
                />
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton
                  label="Lihat Detail"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-eye"
                  size="sm"
                  data-cursor="button"
                />

                <UButton
                  v-if="book.digitalAvailable"
                  label="Baca Digital"
                  color="primary"
                  variant="solid"
                  icon="i-lucide-book-open"
                  size="sm"
                  data-cursor="primary"
                />

                <UButton
                  v-if="book.physicalAvailable"
                  label="Ajukan Pinjam"
                  color="neutral"
                  variant="subtle"
                  icon="i-lucide-handshake"
                  size="sm"
                  data-cursor="primary"
                />
              </div>
            </div>
          </UCard>
        </UPageGrid>

        <UCard
          v-else
          class="border-dashed bg-default/70 text-center backdrop-blur"
        >
          <UIcon
            name="i-lucide-search-x"
            class="mx-auto mb-4 size-8 text-muted"
          />

          <h2 class="text-lg font-semibold text-highlighted">
            Koleksi tidak ditemukan
          </h2>

          <p class="mt-2 text-sm text-muted">
            Coba ubah kata kunci, kategori, atau filter ketersediaan.
          </p>
        </UCard>
      </div>
    </UPageSection>
  </div>
</template>
