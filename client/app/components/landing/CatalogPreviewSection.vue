<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { BOOKS_PREVIEW, CATALOG_FILTERS } from '~/constants/catalog'

const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 400)
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')
const query = ref('')
const selectedFilter = ref('Semua')

const openFullCatalog = async () => {
  const normalizedQuery = query.value.trim()

  await navigateTo({
    path: '/dashboard/katalog',
    query: normalizedQuery ? { q: normalizedQuery } : undefined
  })
}

const filteredBooks = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()

  return BOOKS_PREVIEW.filter((book) => {
    const matchesFilter = selectedFilter.value === 'Semua' || book.category === selectedFilter.value
    const matchesQuery = !normalizedQuery || book.title.toLowerCase().includes(normalizedQuery) || book.category.toLowerCase().includes(normalizedQuery)

    return matchesFilter && matchesQuery
  })
})
</script>

<template>
  <section
    id="katalog"
    v-motion
    class="landing-section"
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
  >
    <UPageSection
      title="Cari koleksi sebelum datang ke perpustakaan"
      description="Preview katalog ini bisa difilter langsung, seperti alur pencarian buku di aplikasi anggota."
      class="py-0"
    >
      <div class="space-y-5">
        <div
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
          class="rounded-xl border border-default bg-default/75 p-3 shadow-sm backdrop-blur"
        >
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="w-full lg:max-w-xl">
              <div class="flex flex-col gap-2 sm:flex-row">
                <UInput
                  v-model="query"
                  icon="i-lucide-search"
                  placeholder="Cari buku, kategori, atau topik..."
                  size="lg"
                  class="w-full"
                  data-cursor="search"
                  @keyup.enter="openFullCatalog"
                />

                <UButton
                  label="Cari"
                  icon="i-lucide-search"
                  size="lg"
                  class="sm:w-auto"
                  data-cursor="primary"
                  @click="openFullCatalog"
                />
              </div>

              <p class="mt-2 text-xs text-muted">
                Tekan Enter atau buka katalog lengkap untuk pencarian lebih detail.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="filter in CATALOG_FILTERS"
                :key="filter"
                :label="filter"
                :variant="selectedFilter === filter ? 'solid' : 'soft'"
                :color="selectedFilter === filter ? 'primary' : 'neutral'"
                size="sm"
                class="transition-all duration-200 hover:-translate-y-0.5"
                data-cursor="button"
                @click="selectedFilter = filter"
              />
            </div>
          </div>
        </div>

        <UPageGrid class="gap-4 sm:gap-5 lg:gap-6">
          <UPageCard
            v-for="(book, index) in filteredBooks"
            :key="book.id"
            v-motion
            :initial="{ opacity: 0, y: 18 }"
            :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : index * 60, ease: 'easeOut' } }"
            :title="book.title"
            :description="book.category"
            class="group transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            data-cursor="card"
          >
            <template #header>
              <div class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 via-default to-secondary/20">
                <div class="absolute inset-0 bg-grid-soft opacity-50" />

                <div class="relative flex size-20 items-center justify-center rounded-2xl bg-default/80 shadow-lg backdrop-blur transition-transform duration-300 group-hover:scale-105">
                  <UIcon
                    name="i-lucide-book-marked"
                    class="size-9 text-primary"
                  />
                </div>

                <UBadge
                  class="absolute left-3 top-3"
                  color="neutral"
                  variant="soft"
                  :label="book.category"
                />

                <span class="absolute bottom-3 right-3 rounded-full bg-default/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
                  {{ book.title.charAt(0) }}
                </span>
              </div>
            </template>

            <template #footer>
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
            </template>
          </UPageCard>
        </UPageGrid>

        <UCard
          v-if="filteredBooks.length === 0"
          class="border-dashed text-center"
        >
          <UIcon
            name="i-lucide-search-x"
            class="mx-auto mb-3 size-7 text-muted"
          />

          <p class="font-medium text-highlighted">
            Koleksi tidak ditemukan
          </p>

          <p class="mt-1 text-sm text-muted">
            Coba kata kunci atau kategori lain.
          </p>
        </UCard>

        <div class="flex justify-center">
          <UButton
            to="/dashboard/katalog"
            label="Buka Katalog Lengkap"
            icon="i-lucide-library"
            color="neutral"
            variant="subtle"
            data-cursor="primary"
          />
        </div>
      </div>
    </UPageSection>
  </section>
</template>
