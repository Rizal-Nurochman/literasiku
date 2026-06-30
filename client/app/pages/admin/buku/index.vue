<script setup lang="ts">
import type { BookResponse } from '#shared/types/books'
import { BOOK_STATUS } from '#shared/types/books'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { useBooksList, deleteBookMutation } = useBooks()
const { categories } = useCategories()

const page = ref(1)
const limit = ref(10)
const search = ref('')
const selectedCategoryId = ref<number | undefined>(undefined)

const { data: booksData, isLoading, isFetching } = useBooksList({
  page,
  limit,
  search,
  categoryId: selectedCategoryId
})

const books = computed(() => booksData.value?.data ?? [])
const totalPages = computed(() => booksData.value?.total_pages ?? 1)
const totalBooks = computed(() => booksData.value?.total ?? 0)

const categoryOptions = computed(() => {
  const cats = categories.value ?? []
  return [
    { label: 'Semua Kategori', value: undefined },
    ...cats.map(c => ({ label: c.name, value: c.id }))
  ]
})

const categoryMap = computed(() => {
  const map = new Map<number, string>()
  const cats = categories.value ?? []
  cats.forEach(c => map.set(c.id, c.name))
  return map
})

const statusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'INACTIVE': return 'neutral'
    case 'DAMAGED': return 'warning'
    case 'LOST': return 'error'
    default: return 'neutral'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'Aktif'
    case 'INACTIVE': return 'Nonaktif'
    case 'DAMAGED': return 'Rusak'
    case 'LOST': return 'Hilang'
    default: return status
  }
}

const columns = [
  { key: 'title', label: 'Judul Buku' },
  { key: 'author', label: 'Penulis' },
  { key: 'category', label: 'Kategori' },
  { key: 'isbn', label: 'ISBN' },
  { key: 'physical_stock', label: 'Stok Fisik' },
  { key: 'availability', label: 'Ketersediaan' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' }
]

const deleteTarget = ref<BookResponse | null>(null)
const showDeleteModal = ref(false)

const confirmDelete = (book: BookResponse) => {
  deleteTarget.value = book
  showDeleteModal.value = true
}

const executeDelete = () => {
  if (!deleteTarget.value) return
  deleteBookMutation.mutate(deleteTarget.value.id, {
    onSuccess: () => {
      showDeleteModal.value = false
      deleteTarget.value = null
    }
  })
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
  }, 400)
})

watch(selectedCategoryId, () => {
  page.value = 1
})

const goToCreate = async () => {
  await router.push('/admin/buku/create')
}

const goToEdit = async (id: number) => {
  await router.push(`/admin/buku/${id}/edit`)
}


const toggleModal = async () => {
  showDeleteModal.value = !showDeleteModal.value
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Manajemen Buku</h1>
        <p class="text-sm text-muted mt-1">
          Kelola koleksi buku perpustakaan —
          <span class="font-medium">{{ totalBooks }}</span> buku terdaftar
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Tambah Buku"
        color="primary"
        size="md"
        @click="goToCreate"
      />
    </div>

    <UCard>
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Cari judul, penulis, ISBN..."
          class="flex-1"
          size="md"
        />
        <USelectMenu
          v-model="selectedCategoryId"
          :items="categoryOptions"
          value-key="value"
          placeholder="Filter Kategori"
          class="w-full sm:w-56"
          size="md"
        />
      </div>
    </UCard>

    <UCard>
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="text-center space-y-3">
          <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
          <p class="text-sm text-muted">Memuat data buku...</p>
        </div>
      </div>

      <div v-else-if="books.length === 0" class="flex flex-col items-center justify-center py-16 space-y-4">
        <div class="rounded-full bg-primary/10 p-4">
          <UIcon name="i-lucide-book-x" class="size-10 text-primary" />
        </div>
        <div class="text-center">
          <p class="font-semibold text-lg">Tidak ada buku ditemukan</p>
          <p class="text-sm text-muted mt-1">
            {{ search || selectedCategoryId ? 'Coba ubah filter pencarian Anda' : 'Mulai dengan menambahkan buku baru' }}
          </p>
        </div>
        <UButton
          v-if="!search && !selectedCategoryId"
          icon="i-lucide-plus"
          label="Tambah Buku Pertama"
          color="primary"
          variant="soft"
          @click="goToCreate"
        />
      </div>

      <div v-else class="relative">
        <div
          v-if="isFetching && !isLoading"
          class="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]"
        >
          <UIcon name="i-lucide-loader-2" class="size-5 animate-spin text-primary" />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-200 dark:border-zinc-800">
                <th
                  v-for="col in columns"
                  :key="col.key"
                  class="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="book in books"
                :key="book.id"
                class="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <td class="px-4 py-3">
                  <div class="max-w-[260px]">
                    <p class="font-medium truncate">{{ book.title }}</p>
                    <p class="text-xs text-muted truncate mt-0.5">
                      {{ book.publisher || '-' }} · {{ book.year_published }}
                    </p>
                  </div>
                </td>
                <td class="px-4 py-3 text-muted">{{ book.author }}</td>
                <td class="px-4 py-3">
                  <UBadge
                    variant="subtle"
                    color="secondary"
                    size="xs"
                  >
                    {{ categoryMap.get(book.category_id) ?? 'Tanpa Kategori' }}
                  </UBadge>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-muted">{{ book.isbn || '-' }}</td>
                <td class="px-4 py-3">
                  <span
                    :class="book.physical_stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'"
                    class="font-semibold"
                  >
                    {{ book.physical_stock }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <UTooltip text="Fisik">
                      <UIcon
                        name="i-lucide-book-copy"
                        :class="book.is_physical_available ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'"
                        class="size-4"
                      />
                    </UTooltip>
                    <UTooltip text="Digital">
                      <UIcon
                        name="i-lucide-tablet-smartphone"
                        :class="book.is_digital_available ? 'text-blue-500' : 'text-zinc-300 dark:text-zinc-600'"
                        class="size-4"
                      />
                    </UTooltip>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <UBadge :color="statusColor(book.status)" variant="subtle" size="xs">
                    {{ statusLabel(book.status) }}
                  </UBadge>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <UTooltip text="Edit">
                      <UButton
                        icon="i-lucide-pencil"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        @click="() => goToEdit(book.id)"
                      />
                    </UTooltip>
                    <UTooltip text="Hapus">
                      <UButton
                        icon="i-lucide-trash-2"
                        variant="ghost"
                        color="error"
                        size="xs"
                        @click="confirmDelete(book)"
                      />
                    </UTooltip>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="books.length > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4"
      >
        <p class="text-xs text-muted">
          Halaman {{ page }} dari {{ totalPages }} · {{ totalBooks }} buku
        </p>
        <UPagination
          v-model="page"
          :total="totalBooks"
          :items-per-page="limit"
        />
      </div>
    </UCard>

    <UModal v-model="showDeleteModal">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="rounded-full bg-red-100 dark:bg-red-900/30 p-2.5">
              <UIcon name="i-lucide-alert-triangle" class="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 class="font-semibold text-lg">Hapus Buku</h3>
              <p class="text-sm text-muted">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>

          <p class="text-sm">
            Apakah Anda yakin ingin menghapus buku
            <strong>"{{ deleteTarget?.title }}"</strong>?
          </p>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              label="Batal"
              variant="ghost"
              color="neutral"
              @click="toggleModal"
            />
            <UButton
              label="Hapus"
              color="error"
              icon="i-lucide-trash-2"
              :loading="deleteBookMutation.isPending.value"
              @click="executeDelete"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>