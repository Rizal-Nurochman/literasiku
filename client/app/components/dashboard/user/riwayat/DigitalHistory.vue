<script setup lang="ts">
const { useMyDigitalLoans } = useLoans()
const router = useRouter()

const page = ref(1)
const limit = ref(10)

const { data: response, isLoading } = useMyDigitalLoans({ page, limit })

const loans = computed(() => response.value?.data ?? [])
const total = computed(() => response.value?.total ?? 0)

const columns = [
  { accessorKey: 'id', header: 'ID Pinjam' },
  { accessorKey: 'book_title', header: 'Judul Buku' },
  { accessorKey: 'start_date', header: 'Tgl Mulai' },
  { accessorKey: 'end_date', header: 'Tgl Berakhir' },
  { accessorKey: 'access_status', header: 'Status Akses' },
  { id: 'actions', header: '' }
]

const getStatusColor = (status: string): 'success' | 'neutral' | 'error' => {
  const map: Record<string, 'success' | 'neutral' | 'error'> = {
    'ACTIVE': 'success',
    'EXPIRED': 'neutral',
    'REVOKED': 'error'
  }
  return map[status] || 'neutral'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const readBook = (bookId: number) => {
  router.push(`/dashboard/riwayat/baca/${bookId}`)
}
</script>

<template>
  <div class="space-y-4">
    <UTable
      :data="loans"
      :columns="columns"
      :loading="isLoading"
      class="bg-default/80 backdrop-blur rounded-xl border border-default shadow-sm"
    >
      <template #start_date-cell="{ row }">
        {{ formatDate((row.original as any).start_date) }}
      </template>
      <template #end_date-cell="{ row }">
        {{ formatDate((row.original as any).end_date) }}
      </template>
      <template #access_status-cell="{ row }">
        <UBadge :color="getStatusColor((row.original as any).access_status)" variant="subtle">
          {{ (row.original as any).access_status }}
        </UBadge>
      </template>
      <template #actions-cell="{ row }">
        <UButton
          v-if="(row.original as any).access_status === 'ACTIVE'"
          label="Baca Sekarang"
          color="primary"
          variant="soft"
          icon="i-lucide-book-open"
          size="sm"
          @click="readBook((row.original as any).book_id)"
        />
      </template>
    </UTable>

    <div class="flex justify-end" v-if="total > 0">
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
      />
    </div>
  </div>
</template>
