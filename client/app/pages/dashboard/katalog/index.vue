<script setup lang="ts">
import DashboardUserCatalogHeader from '~/components/dashboard/user/CatalogHeader.vue'
import DashboardUserCatalogFilters from '~/components/dashboard/user/CatalogFilters.vue'
import DashboardUserCatalogEmptyState from '~/components/dashboard/user/CatalogEmptyState.vue'
import DashboardUserBookCard from '~/components/dashboard/user/BookCard.vue'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Katalog Buku - Literasiku',
  description: 'Cari koleksi buku fisik dan digital di Literasiku.'
})

const { categories } = useCategories()
const { useBooksList } = useBooks()

const page = ref(1)
const limit = ref(12)
const search = ref('')
const selectedCategoryId = ref<number | undefined>(undefined)
const selectedAvailability = ref('Semua')

const { data: booksData, isLoading: isBooksLoading } = useBooksList({
  page,
  limit,
  search,
  categoryId: selectedCategoryId
})

const books = computed(() => booksData.value?.data ?? [])
const total = computed(() => booksData.value?.total ?? 0)

const filteredBooks = computed(() => {
  return books.value.filter((book) => {
    if (selectedAvailability.value === 'Fisik Tersedia') {
      return book.physical_stock > 0
    }
    if (selectedAvailability.value === 'Digital Tersedia') {
      return book.is_digital_available
    }
    return true
  })
})
</script>

<template>
  <div class="relative isolate overflow-hidden min-h-[calc(100vh-4rem)]">
    <DashboardUserCatalogHeader />
    
    <div class="container mx-auto px-4 pb-12 -mt-4">
      <DashboardUserCatalogFilters 
        v-model:search="search"
        v-model:category-id="selectedCategoryId"
        v-model:availability="selectedAvailability"
        :categories="categories"
      />

      <div v-if="isBooksLoading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
      </div>

      <template v-else>
        <UPageGrid v-if="filteredBooks.length">
          <DashboardUserBookCard 
            v-for="(book, index) in filteredBooks" 
            :key="book.id" 
            :book="book" 
            :index="index" 
          />
        </UPageGrid>

        <DashboardUserCatalogEmptyState v-else />

        <div class="flex justify-center mt-8" v-if="total > 0 && selectedAvailability === 'Semua'">
          <UPagination
            v-model:page="page"
            :total="total"
            :items-per-page="limit"
          />
        </div>
      </template>
    </div>
  </div>
</template>
