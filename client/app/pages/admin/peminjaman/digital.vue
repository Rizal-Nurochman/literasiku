<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Manajemen Peminjaman Digital - Literasiku'
})

const page = ref(1)
const limit = ref(10)
const status = ref('ALL')

const statusOptions = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'EXPIRED', value: 'EXPIRED' },
  { label: 'REVOKED', value: 'REVOKED' }
]

const { useAllDigitalLoans, revokeDigitalMutation } = useLoans()
const { data, isLoading } = useAllDigitalLoans({ page, limit, status })

const loans = computed(() => data.value?.data || [])
const total = computed(() => data.value?.total || 0)

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { id: 'user', header: 'Peminjam' },
  { accessorKey: 'book_title', header: 'Buku' },
  { accessorKey: 'start_date', header: 'Tgl Mulai' },
  { accessorKey: 'end_date', header: 'Tgl Berakhir' },
  { accessorKey: 'access_status', header: 'Status' },
  { id: 'actions', header: '' }
]

const getStatusColor = (status: string): 'success' | 'error' | 'neutral' => {
  const map: Record<string, 'success' | 'error' | 'neutral'> = {
    'ACTIVE': 'success',
    'EXPIRED': 'neutral',
    'REVOKED': 'error'
  }
  return map[status] || 'neutral'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID')
}

const revokeAccess = (id: number) => {
  if (confirm('Apakah Anda yakin ingin mencabut akses buku digital ini?')) {
    revokeDigitalMutation.mutate(id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-default">Peminjaman Digital</h1>
        <p class="text-sm text-muted mt-1">Kelola hak akses baca buku digital pengguna</p>
      </div>
    </div>

    <UCard class="bg-default/80 backdrop-blur border-default shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-2">
          <USelect
            v-model="status"
            :items="statusOptions"
            class="w-48"
          />
        </div>
      </div>

      <UTable
        :data="loans"
        :columns="columns"
        :loading="isLoading"
        class="w-full"
      >
        <template #id-cell="{ row }">
          <span class="font-mono text-xs text-muted">#{{ (row.original as any).id }}</span>
        </template>
        <template #user-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-sm">{{ (row.original as any).user_full_name || 'Tidak diketahui' }}</span>
            <span class="text-xs text-muted">@{{ (row.original as any).username || 'unknown' }}</span>
          </div>
        </template>
        <template #book_title-cell="{ row }">
          <span class="font-medium text-sm line-clamp-2">{{ (row.original as any).book_title }}</span>
        </template>
        <template #start_date-cell="{ row }">
          <span class="text-sm">{{ formatDate((row.original as any).start_date) }}</span>
        </template>
        <template #end_date-cell="{ row }">
          <span class="text-sm">{{ formatDate((row.original as any).end_date) }}</span>
        </template>
        <template #access_status-cell="{ row }">
          <UBadge :color="getStatusColor((row.original as any).access_status)" variant="subtle" size="sm">
            {{ (row.original as any).access_status }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2 justify-end">
            <UTooltip text="Cabut Akses" v-if="(row.original as any).access_status === 'ACTIVE'">
              <UButton
                color="error"
                variant="soft"
                icon="i-lucide-ban"
                size="xs"
                @click="revokeAccess((row.original as any).id)"
                :loading="revokeDigitalMutation.isPending.value"
              />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between mt-6" v-if="total > 0">
        <span class="text-sm text-muted">Total {{ total }} data</span>
        <UPagination
          v-model:page="page"
          :items-per-page="limit"
          :total="total"
        />
      </div>
    </UCard>
  </div>
</template>
