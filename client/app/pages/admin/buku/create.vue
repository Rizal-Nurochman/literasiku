<script setup lang="ts">
import { createBookSchema } from '#shared/schemas/books.schema'
import type { CreateBookInput } from '#shared/schemas/books.schema'
import { BOOK_STATUS } from '#shared/types/books'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { createBookMutation } = useBooks()
const { useCategoriesList } = useCategories()

const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesList()

const categoryOptions = computed(() => {
  const cats = categoriesData.value?.data ?? []
  return cats.map(c => ({ label: c.name, value: c.id }))
})

const statusOptions = BOOK_STATUS.map(s => {
  const labels: Record<string, string> = {
    ACTIVE: 'Aktif',
    INACTIVE: 'Nonaktif',
    DAMAGED: 'Rusak',
    LOST: 'Hilang'
  }
  return { label: labels[s] ?? s, value: s }
})

const state = reactive<CreateBookInput>({
  title: '',
  author: '',
  publisher: '',
  year_published: new Date().getFullYear(),
  isbn: '',
  category_id: 0,
  physical_stock: 0,
  is_physical_available: true,
  is_digital_available: false,
  status: 'ACTIVE'
})

const onSubmit = () => {
  createBookMutation.mutate(state, {
    onSuccess: () => {
      router.push('/admin/buku')
    }
  })
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        size="sm"
        @click="router.push('/admin/buku')"
      />
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Tambah Buku Baru</h1>
        <p class="text-sm text-muted mt-0.5">Isi informasi buku yang akan ditambahkan ke perpustakaan</p>
      </div>
    </div>

    <!-- Form -->
    <UCard>
      <UForm
        :schema="createBookSchema"
        :state="state"
        class="space-y-6"
        @submit="onSubmit"
      >
        <!-- Info Dasar -->
        <div class="space-y-1.5">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-muted">Informasi Dasar</h3>
          <USeparator />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Judul Buku" name="title" required class="md:col-span-2">
            <UInput
              v-model="state.title"
              placeholder="Masukkan judul buku"
              icon="i-lucide-book-open"
              size="md"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Penulis" name="author" required>
            <UInput
              v-model="state.author"
              placeholder="Nama penulis"
              icon="i-lucide-user"
              size="md"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Penerbit" name="publisher">
            <UInput
              v-model="state.publisher"
              placeholder="Nama penerbit"
              icon="i-lucide-building-2"
              size="md"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Tahun Terbit" name="year_published" required>
            <UInput
              v-model.number="state.year_published"
              type="number"
              placeholder="2024"
              icon="i-lucide-calendar"
              :min="1000"
              :max="2100"
              size="md"
              class="w-full"
            />
          </UFormField>

          <UFormField label="ISBN" name="isbn">
            <UInput
              v-model="state.isbn"
              placeholder="978-xxx-xxx-xxx"
              icon="i-lucide-barcode"
              size="md"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Klasifikasi -->
        <div class="space-y-1.5 pt-2">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-muted">Klasifikasi & Stok</h3>
          <USeparator />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Kategori" name="category_id" required>
            <USelectMenu
              v-model="state.category_id"
              :items="categoryOptions"
              value-key="value"
              placeholder="Pilih kategori"
              :loading="categoriesLoading"
              size="md"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Status" name="status">
            <USelectMenu
              v-model="state.status"
              :items="statusOptions"
              value-key="value"
              placeholder="Pilih status"
              size="md"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Stok Fisik" name="physical_stock">
            <UInput
              v-model.number="state.physical_stock"
              type="number"
              :min="0"
              placeholder="0"
              icon="i-lucide-package"
              size="md"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Ketersediaan -->
        <div class="space-y-1.5 pt-2">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-muted">Ketersediaan</h3>
          <USeparator />
        </div>

        <div class="flex flex-col sm:flex-row gap-6">
          <UFormField name="is_physical_available">
            <div class="flex items-center gap-3">
              <USwitch v-model="state.is_physical_available" />
              <div>
                <p class="text-sm font-medium">Tersedia Fisik</p>
                <p class="text-xs text-muted">Buku dapat dipinjam secara fisik</p>
              </div>
            </div>
          </UFormField>

          <UFormField name="is_digital_available">
            <div class="flex items-center gap-3">
              <USwitch v-model="state.is_digital_available" />
              <div>
                <p class="text-sm font-medium">Tersedia Digital</p>
                <p class="text-xs text-muted">Buku dapat dibaca secara digital</p>
              </div>
            </div>
          </UFormField>
        </div>

        <!-- Actions -->
        <USeparator />

        <div class="flex justify-end gap-3">
          <UButton
            label="Batal"
            variant="ghost"
            color="neutral"
            size="md"
            @click="router.push('/admin/buku')"
          />
          <UButton
            type="submit"
            label="Simpan Buku"
            icon="i-lucide-save"
            color="primary"
            size="md"
            :loading="createBookMutation.isPending.value"
          />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
