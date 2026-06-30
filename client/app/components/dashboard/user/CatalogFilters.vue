<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import type { CategoryResponse } from '#shared/types/categories'

const props = defineProps<{
  categories: CategoryResponse[]
}>()

const search = defineModel<string>('search')
const selectedCategory = defineModel<number | undefined>('categoryId')
const selectedAvailability = defineModel<string>('availability')

const preferredMotion = usePreferredReducedMotion()
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')
const duration = computed(() => shouldReduceMotion.value ? 0 : 450)

const availabilityFilters = [
  'Semua',
  'Fisik Tersedia',
  'Digital Tersedia'
]

const searchInput = ref(search.value)

const onSearch = () => {
  search.value = searchInput.value
}


const toggleSelectCategory = (categoryId: number) => {
  selectedCategory.value = selectedCategory.value === categoryId ? undefined : categoryId
}

const toggleSelectAvailability = (availability: string) => {
  selectedAvailability.value = selectedAvailability.value === availability ? undefined : availability
}
</script>

<template>
  <UCard
    v-motion
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : 90, ease: 'easeOut' } }"
    class="border-default/80 bg-default/80 shadow-xl shadow-primary/5 backdrop-blur mb-8"
  >
    <div class="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
      <div class="space-y-3">
        <UInput
          v-model="searchInput"
          icon="i-lucide-search"
          size="xl"
          placeholder="Cari judul buku, penulis, atau topik..."
          @keyup.enter="onSearch"
        />
        <UButton color="neutral" variant="ghost" size="sm" @click="onSearch">Terapkan Pencarian</UButton>
      </div>

      <div class="grid gap-3 lg:min-w-72">
        <div>
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Kategori
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              label="Semua"
              :variant="selectedCategory === undefined ? 'solid' : 'soft'"
              :color="selectedCategory === undefined ? 'primary' : 'neutral'"
              size="sm"
              @click="selectedCategory = undefined"
            />
            <UButton
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :variant="selectedCategory === category.id ? 'solid' : 'soft'"
              :color="selectedCategory === category.id ? 'primary' : 'neutral'"
              size="sm"
              @click="toggleSelectCategory(category.id)"
            />
          </div>
        </div>

        <div>
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Ketersediaan
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="availability in availabilityFilters"
              :key="availability"
              :label="availability"
              :variant="selectedAvailability === availability ? 'solid' : 'soft'"
              :color="selectedAvailability === availability ? 'primary' : 'neutral'"
              size="sm"
              @click="toggleSelectAvailability(availability)"
            />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
