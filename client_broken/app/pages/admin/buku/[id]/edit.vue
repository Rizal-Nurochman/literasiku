<script setup lang="ts">
import { bookSchema, type BookInput } from '#shared/schemas/book.schema'

definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Edit Buku - Admin Literasiku'
})

const route = useRoute()
const bookId = Number(route.params.id)

const { useBookDetailQuery, updateBookMutation } = useBook()
const { data, isLoading } = useBookDetailQuery(bookId)

const state = reactive<BookInput>({
  category_id: 1,
  title: '',
  author: '',
  publisher: '',
  year_published: new Date().getFullYear(),
  isbn: '',
  physical_stock: 0,
  is_physical_available: true,
  is_digital_available: false,
  status: 'ACTIVE',
  book_url: ''
})

// Populate state when data is loaded
watchEffect(() => {
  if (data.value?.data) {
    const book = data.value.data
    state.category_id = book.category_id
    state.title = book.title
    state.author = book.author
    state.publisher = book.publisher || ''
    state.year_published = book.year_published
    state.isbn = book.isbn || ''
    state.physical_stock = book.physical_stock
    state.is_physical_available = book.is_physical_available
    state.is_digital_available = book.is_digital_available
    state.status = book.status
    state.book_url = book.book_url || ''
  }
})

const onSubmit = () => {
  updateBookMutation.mutate({ id: bookId, input: state })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        to="/admin/buku"
      />
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          Edit Buku
        </h1>
        <p class="text-sm text-muted">
          Ubah detail buku fisik atau digital.
        </p>
      </div>
    </div>

    <UCard>
      <div v-if="isLoading" class="flex justify-center p-8">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
      </div>

      <UForm
        v-else
        :schema="bookSchema"
        :state="state"
        class="space-y-6"
        @submit="onSubmit"
      >
        <div class="grid gap-6 md:grid-cols-2">
          <UFormGroup label="Judul Buku" name="title" required>
            <UInput v-model="state.title" placeholder="Contoh: Belajar Nuxt 4" />
          </UFormGroup>

          <UFormGroup label="Penulis" name="author" required>
            <UInput v-model="state.author" placeholder="Nama Penulis" />
          </UFormGroup>

          <UFormGroup label="Penerbit" name="publisher">
            <UInput v-model="state.publisher" placeholder="Nama Penerbit" />
          </UFormGroup>

          <UFormGroup label="Tahun Terbit" name="year_published" required>
            <UInput v-model.number="state.year_published" type="number" />
          </UFormGroup>

          <UFormGroup label="Kategori ID" name="category_id" required>
            <!-- Dalam praktiknya gunakan USelectMenu dari API Kategori -->
            <UInput v-model.number="state.category_id" type="number" />
          </UFormGroup>

          <UFormGroup label="ISBN" name="isbn">
            <UInput v-model="state.isbn" placeholder="ISBN Buku" />
          </UFormGroup>

          <UFormGroup label="Stok Fisik" name="physical_stock" required>
            <UInput v-model.number="state.physical_stock" type="number" />
          </UFormGroup>

          <UFormGroup label="Status" name="status" required>
            <USelect
              v-model="state.status"
              :options="['ACTIVE', 'INACTIVE', 'DAMAGED', 'LOST']"
            />
          </UFormGroup>
        </div>

        <USeparator class="my-6" />

        <div class="grid gap-6 md:grid-cols-2">
          <UFormGroup label="Ketersediaan Fisik" name="is_physical_available">
            <UToggle v-model="state.is_physical_available" />
          </UFormGroup>

          <UFormGroup label="Ketersediaan Digital" name="is_digital_available">
            <UToggle v-model="state.is_digital_available" />
          </UFormGroup>
        </div>

        <UFormGroup v-if="state.is_digital_available" label="URL File PDF Buku" name="book_url">
          <UInput v-model="state.book_url" placeholder="https://contoh.com/buku.pdf" />
          <p class="mt-1 text-xs text-muted">URL ini diperlukan untuk diproses oleh AI Agent (Embedding).</p>
        </UFormGroup>

        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="soft"
            label="Batal"
            to="/admin/buku"
          />
          <UButton
            type="submit"
            color="primary"
            label="Simpan Perubahan"
            :loading="updateBookMutation.isPending.value"
          />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
