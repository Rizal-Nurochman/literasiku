<script setup lang="ts">
import { updateUserSchema } from '#shared/schemas/users.schema'
import type { UserResponse } from '#shared/types/users'

definePageMeta({
  layout: 'admin'
})

const page = ref(1)
const limit = ref(10)
const search = ref('')
const searchInput = ref('')
const roleFilter = ref('ALL')

const roleOptions = [
  { label: 'Semua Peran', value: 'ALL' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Anggota', value: 'USER' }
]

const statusOptions = [
  { label: 'Aktif', value: 'ACTIVE' },
  { label: 'Non-aktif', value: 'INACTIVE' },
  { label: 'Diblokir', value: 'BLOCKED' }
]

const { 
  users, 
  total, 
  isLoading, 
  updateMutation, 
  deleteMutation 
} = useUsers({
  page: page,
  limit: limit,
  search: search,
  role: computed(() => roleFilter.value === 'ALL' ? '' : roleFilter.value)
})

watch(page, () => {
})

watch(roleFilter, () => {
  page.value = 1
})

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'full_name', label: 'Nama Lengkap' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Peran' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Terdaftar Pada' },
  { key: 'actions', label: 'Aksi' }
]

const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const selectedUser = ref<UserResponse | null>(null)

const state = reactive({
  full_name: '',
  username: '',
  email: '',
  phone_number: '',
  address: '',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
})

const openEditModal = (user: UserResponse) => {
  selectedUser.value = user
  state.full_name = user.full_name || ''
  state.username = user.username || ''
  state.email = user.email || ''
  state.phone_number = user.phone_number || ''
  state.address = user.address || ''
  state.status = user.status || 'ACTIVE'
  isEditModalOpen.value = true
}

const openDeleteModal = (user: UserResponse) => {
  selectedUser.value = user
  isDeleteModalOpen.value = true
}

const onSearch = () => {
  search.value = searchInput.value
  page.value = 1
}

const onSubmitEdit = async () => {
  if (!selectedUser.value) return
  await updateMutation.mutateAsync({ 
    id: selectedUser.value.id, 
    data: { 
      full_name: state.full_name,
      username: state.username,
      email: state.email,
      phone_number: state.phone_number,
      address: state.address,
      status: state.status
    } 
  })
  isEditModalOpen.value = false
}

const onConfirmDelete = async () => {
  if (!selectedUser.value) return
  await deleteMutation.mutateAsync(selectedUser.value.id)
  isDeleteModalOpen.value = false
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'INACTIVE': return 'warning'
    case 'BLOCKED': return 'error'
    default: return 'neutral'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Manajemen Anggota</h1>
    </div>

    <UCard>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <UInput 
              v-model="searchInput" 
              icon="i-lucide-search" 
              placeholder="Cari anggota..." 
              @keyup.enter="onSearch"
            />
            <UButton variant="ghost" @click="onSearch">Cari</UButton>
          </div>
          <USelect 
            v-model="roleFilter" 
            :options="roleOptions" 
            option-attribute="label"
            value-attribute="value"
          />
        </div>
      </div>

      <UTable 
        :columns="(columns as any)" 
        :rows="(users as UserResponse[])" 
        :loading="isLoading"
      >
        <template #status-data="{ row }">
          <UBadge :color="getStatusColor((row as unknown as UserResponse).status)" variant="soft">
            {{ (row as unknown as UserResponse).status }}
          </UBadge>
        </template>
        <template #created_at-data="{ row }">
          {{ formatDate((row as unknown as UserResponse).created_at) }}
        </template>
        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UButton size="sm" color="warning" variant="soft" icon="i-lucide-edit" @click="openEditModal(row as unknown as UserResponse)" />
            <UButton size="sm" color="error" variant="soft" icon="i-lucide-trash" @click="openDeleteModal(row as unknown as UserResponse)" />
          </div>
        </template>
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 text-gray-500">
            <UIcon name="i-lucide-users" class="w-12 h-12 mb-2 opacity-50" />
            <p>Tidak ada data anggota ditemukan.</p>
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

    <UModal v-model="isEditModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Edit Profil & Status Anggota</h3>
        </template>
        <UForm :schema="updateUserSchema" :state="state" @submit="onSubmitEdit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Nama Lengkap" name="full_name">
              <UInput v-model="state.full_name" placeholder="Nama lengkap" />
            </UFormGroup>
            <UFormGroup label="Username" name="username">
              <UInput v-model="state.username" placeholder="Username" />
            </UFormGroup>
          </div>
          <UFormGroup label="Email" name="email">
            <UInput v-model="state.email" type="email" placeholder="Alamat email" />
          </UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Nomor Telepon" name="phone_number">
              <UInput v-model="state.phone_number" placeholder="Nomor telepon" />
            </UFormGroup>
            <UFormGroup label="Status" name="status">
              <USelect 
                v-model="state.status" 
                :options="statusOptions" 
                option-attribute="label"
                value-attribute="value"
              />
            </UFormGroup>
          </div>
          <UFormGroup label="Alamat" name="address">
            <UInput v-model="state.address" placeholder="Alamat lengkap" />
          </UFormGroup>
          
          <div class="flex justify-end gap-2 mt-6">
            <UButton color="neutral" variant="ghost" @click="() => { isEditModalOpen = false }">Batal</UButton>
            <UButton type="submit" color="primary" :loading="updateMutation.isPending.value">Simpan Perubahan</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-500">Hapus Anggota</h3>
        </template>
        <p>Apakah Anda yakin ingin menghapus anggota <strong>{{ selectedUser?.full_name || selectedUser?.username }}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="() => { isDeleteModalOpen = false }">Batal</UButton>
            <UButton color="error" :loading="deleteMutation.isPending.value" @click="onConfirmDelete">Hapus</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>