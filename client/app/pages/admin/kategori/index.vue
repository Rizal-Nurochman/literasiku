<script setup lang="ts">
import { createCategorySchema, type CreateCategoryInput, type UpdateCategoryInput } from '#shared/schemas/categories.schema'
import type { CategoryResponse } from '#shared/types/categories'

definePageMeta({
  layout: 'admin'
})

const page = ref(1)
const limit = ref(10)
const search = ref('')
const searchInput = ref('')

const { 
  categories, 
  total, 
  isLoading, 
  createMutation, 
  updateMutation, 
  deleteMutation 
} = useCategories({
  page: page.value,
  limit: limit.value,
  search: search.value
})

watch(page, () => {
})

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nama Kategori' },
  { key: 'created_at', label: 'Dibuat Pada' },
  { key: 'actions', label: 'Aksi' }
]

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const selectedCategory = ref<CategoryResponse | null>(null)

const state = reactive({
  name: ''
})

const openCreateModal = () => {
  state.name = ''
  isCreateModalOpen.value = true
}

const openEditModal = (category: CategoryResponse) => {
  selectedCategory.value = category
  state.name = category.name
  isEditModalOpen.value = true
}

const openDeleteModal = (category: CategoryResponse) => {
  selectedCategory.value = category
  isDeleteModalOpen.value = true
}

const onSearch = () => {
  search.value = searchInput.value
  page.value = 1
}

const onSubmitCreate = async () => {
  await createMutation.mutateAsync({ name: state.name })
  isCreateModalOpen.value = false
}

const onSubmitEdit = async () => {
  if (!selectedCategory.value) return
  await updateMutation.mutateAsync({ id: selectedCategory.value.id, data: { name: state.name } })
  isEditModalOpen.value = false
}

const onConfirmDelete = async () => {
  if (!selectedCategory.value) return
  await deleteMutation.mutateAsync(selectedCategory.value.id)
  isDeleteModalOpen.value = false
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Manajemen Kategori</h1>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreateModal">Tambah Kategori</UButton>
    </div>

    <UCard>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <UInput 
            v-model="searchInput" 
            icon="i-lucide-search" 
            placeholder="Cari kategori..." 
            @keyup.enter="onSearch"
          />
          <UButton color="gray" @click="onSearch">Cari</UButton>
        </div>
      </div>

      <UTable 
        :columns="columns" 
        :rows="categories" 
        :loading="isLoading"
      >
        <template #created_at-data="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UButton size="sm" color="warning" variant="soft" icon="i-lucide-edit" @click="openEditModal(row)" />
            <UButton size="sm" color="error" variant="soft" icon="i-lucide-trash" @click="openDeleteModal(row)" />
          </div>
        </template>
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 text-gray-500">
            <UIcon name="i-lucide-inbox" class="w-12 h-12 mb-2 opacity-50" />
            <p>Tidak ada data kategori ditemukan.</p>
          </div>
        </template>
      </UTable>

      <div class="flex justify-end mt-4" v-if="total > 0">
        <UPagination 
          v-model="page" 
          :page-count="limit" 
          :total="total" 
        />
      </div>
    </UCard>

    <UModal v-model="isCreateModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Tambah Kategori</h3>
        </template>
        <UForm :schema="createCategorySchema" :state="state" @submit="onSubmitCreate" class="space-y-4">
          <UFormGroup label="Nama Kategori" name="name">
            <UInput v-model="state.name" placeholder="Masukkan nama kategori" />
          </UFormGroup>
          <div class="flex justify-end gap-2 mt-6">
            <UButton color="gray" variant="ghost" @click="isCreateModalOpen = false">Batal</UButton>
            <UButton type="submit" color="primary" :loading="createMutation.isPending.value">Simpan</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <UModal v-model="isEditModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Edit Kategori</h3>
        </template>
        <UForm :schema="createCategorySchema" :state="state" @submit="onSubmitEdit" class="space-y-4">
          <UFormGroup label="Nama Kategori" name="name">
            <UInput v-model="state.name" placeholder="Masukkan nama kategori" />
          </UFormGroup>
          <div class="flex justify-end gap-2 mt-6">
            <UButton color="gray" variant="ghost" @click="isEditModalOpen = false">Batal</UButton>
            <UButton type="submit" color="primary" :loading="updateMutation.isPending.value">Simpan Perubahan</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-500">Hapus Kategori</h3>
        </template>
        <p>Apakah Anda yakin ingin menghapus kategori <strong>{{ selectedCategory?.name }}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="gray" variant="ghost" @click="isDeleteModalOpen = false">Batal</UButton>
            <UButton color="error" :loading="deleteMutation.isPending.value" @click="onConfirmDelete">Hapus</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
