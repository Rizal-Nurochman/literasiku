<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Manajemen Buku - Admin Literasiku'
})

const { useBooksQuery, deleteBookMutation, embedBookMutation } = useBook()

const page = ref(1)
const limit = ref(10)
const search = ref('')

const { data, isLoading } = useBooksQuery(page, limit, search)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Judul Buku' },
  { key: 'author', label: 'Penulis' },
  { key: 'category.name', label: 'Kategori' },
  { key: 'physical_stock', label: 'Stok Fisik' },
  { key: 'is_digital_available', label: 'Digital' },
  { key: 'status', label: 'Status' },
  { key: 'actions' }
]

const openDeleteConfirm = ref(false)
const selectedBookId = ref<number | null>(null)

const confirmDelete = (id: number) => {
  selectedBookId.value = id
  openDeleteConfirm.value = true
}

const executeDelete = () => {
  if (selectedBookId.value) {
    deleteBookMutation.mutate(selectedBookId.value)
    openDeleteConfirm.value = false
    selectedBookId.value = null
  }
}

const processAI = (book: any) => {
  if (!book.book_url) {
    useToast().add({ title: 'Gagal', description: 'URL Buku tidak tersedia', color: 'error' })
    return
  }
  embedBookMutation.mutate({ bookId: book.id, pdfUrl: book.book_url })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          Manajemen Buku
        </h1>
        <p class="text-sm text-muted">
          Kelola katalog buku fisik dan digital, stok, serta data embedding AI.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        label="Tambah Buku"
        color="primary"
        to="/admin/buku/tambah"
      />
    </div>

    <UCard>
      <div class="mb-4 flex items-center justify-between gap-4">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Cari judul buku atau penulis..."
          class="w-full max-w-sm"
        />
      </div>

      <UTable
        :rows="data?.data?.data || []"
        :columns="columns"
        :loading="isLoading"
      >
        <template #is_digital_available-data="{ row }">
          <UBadge
            :color="row.is_digital_available ? 'success' : 'neutral'"
            :variant="row.is_digital_available ? 'subtle' : 'soft'"
          >
            {{ row.is_digital_available ? 'Tersedia' : 'Tidak' }}
          </UBadge>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :color="row.status === 'ACTIVE' ? 'primary' : row.status === 'INACTIVE' ? 'neutral' : 'error'"
            variant="subtle"
          >
            {{ row.status }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UTooltip text="Proses Embedding AI" v-if="row.is_digital_available && row.book_url">
              <UButton
                color="info"
                variant="ghost"
                icon="i-lucide-brain-circuit"
                size="sm"
                @click="processAI(row)"
                :loading="embedBookMutation.isPending.value"
              />
            </UTooltip>
            <UTooltip text="Edit Buku">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-edit"
                size="sm"
                :to="`/admin/buku/${row.id}/edit`"
              />
            </UTooltip>
            <UTooltip text="Hapus Buku">
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-trash"
                size="sm"
                @click="confirmDelete(row.id)"
              />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <div class="mt-4 flex justify-end" v-if="data?.data?.total_pages && data.data.total_pages > 1">
        <UPagination
          v-model="page"
          :page-count="limit"
          :total="data.data.total"
        />
      </div>
    </UCard>

    <UModal v-model="openDeleteConfirm">
      <UCard>
        <div class="space-y-4 text-center">
          <UIcon name="i-lucide-alert-triangle" class="mx-auto size-12 text-warning" />
          <h3 class="text-lg font-semibold">Konfirmasi Hapus</h3>
          <p class="text-sm text-muted">Apakah Anda yakin ingin menghapus buku ini? Data yang dihapus tidak dapat dikembalikan.</p>
          <div class="flex justify-center gap-3">
            <UButton color="neutral" variant="soft" label="Batal" @click="openDeleteConfirm = false" />
            <UButton color="error" label="Hapus" @click="executeDelete" :loading="deleteBookMutation.isPending.value" />
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
