<script setup lang="ts">
import type { CategoryResponse } from '#shared/types/categories'
import { createCategorySchema } from '#shared/schemas/categories.schema'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const page = ref(1)
const limit = ref(10)
const search = ref('')

const { categories, total, totalPages, isLoading, deleteMutation, createMutation } = useCategories({
  page,
  limit,
  search
})

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nama Kategori' },
  { accessorKey: 'description', header: 'Deskripsi' },
  { id: 'actions', header: 'Aksi' }
]

const deleteTarget = ref<CategoryResponse | null>(null)
const showDeleteModal = ref(false)

const confirmDelete = (category: CategoryResponse) => {
  deleteTarget.value = category
  showDeleteModal.value = true
}

const executeDelete = () => {
  if (!deleteTarget.value) return
  deleteMutation.mutate(deleteTarget.value.id, {
    onSuccess: () => {
      showDeleteModal.value = false
      deleteTarget.value = null
    }
  })
}

const showCreateModal = ref(false)
const createState = reactive({
  name: ''
})

const goToCreate = () => {
  createState.name = ''
  showCreateModal.value = true
}

const executeCreate = () => {
  createMutation.mutate({ name: createState.name }, {
    onSuccess: () => {
      showCreateModal.value = false
    }
  })
}

const goToEdit = (id: number) => {
  router.push(`/admin/kategori/${id}/edit`)
}

const toggleDeleteModal = (category: CategoryResponse) => {
  deleteTarget.value = category
  showDeleteModal.value = !showDeleteModal.value
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Manajemen Kategori</h1>
        <p class="text-sm text-muted mt-1">
          Kelola kategori buku perpustakaan
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Tambah Kategori"
        color="primary"
        size="md"
        @click="goToCreate"
      />
    </div>

    <UCard>
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Cari kategori..."
          class="flex-1"
          size="md"
        />
      </div>

      <UTable
        :columns="columns"
        :data="categories"
        :loading="isLoading"
        class="w-full"
      >
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UTooltip text="Edit">
              <UButton
                icon="i-lucide-pencil"
                variant="ghost"
                color="neutral"
                size="xs"
                @click="() => goToEdit(row.original.id)"
              />
            </UTooltip>
            <UTooltip text="Hapus">
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                size="xs"
                @click="() => confirmDelete(row.original)"
              />
            </UTooltip>
          </div>
        </template>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-6 text-gray-500">
            <UIcon name="i-lucide-layers" class="w-12 h-12 mb-2 opacity-50" />
            <p>Tidak ada kategori ditemukan.</p>
          </div>
        </template>
      </UTable>

      <div class="flex justify-end mt-4" v-if="total > 0">
        <UPagination
          v-model:page="page"
          :total="total"
          :items-per-page="limit"
        />
      </div>
    </UCard>

    <UModal v-model:open="showDeleteModal">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="rounded-full bg-red-100 dark:bg-red-900/30 p-2.5">
              <UIcon name="i-lucide-alert-triangle" class="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 class="font-semibold text-lg">Hapus Kategori</h3>
              <p class="text-sm text-muted">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>

          <p class="text-sm">
            Apakah Anda yakin ingin menghapus kategori
            <strong>"{{ deleteTarget?.name }}"</strong>?
          </p>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              label="Batal"
              variant="ghost"
              color="neutral"
              @click="confirmDelete(deleteTarget as CategoryResponse)"
            />
            <UButton
              label="Hapus"
              color="error"
              icon="i-lucide-trash-2"
              :loading="deleteMutation.isPending.value"
              @click="executeDelete"
            />
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="showCreateModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Tambah Kategori</h3>
          </template>
          <UForm :schema="createCategorySchema" :state="createState" @submit="executeCreate" class="space-y-4">
            <UFormField label="Nama Kategori" name="name">
              <UInput v-model="createState.name" placeholder="Masukkan nama kategori" autofocus />
            </UFormField>
            <div class="flex justify-end gap-2 mt-6">
              <UButton
                label="Batal"
                color="neutral"
                variant="ghost"
                @click="confirmDelete(deleteTarget as CategoryResponse)"
              />
              <UButton
                label="Simpan"
                type="submit"
                color="primary"
                :loading="createMutation.isPending.value"
              />
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>
  </div>
</template>