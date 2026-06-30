<script setup lang="ts">
const { useMyPhysicalLoans } = useLoans()

const page = ref(1)
const limit = ref(10)

const { data: response, isLoading } = useMyPhysicalLoans({ page, limit })

const loans = computed(() => response.value?.data ?? [])
const total = computed(() => response.value?.total ?? 0)

const columns = [
  { accessorKey: 'id', header: 'ID Pinjam' },
  { accessorKey: 'book_title', header: 'Judul Buku' },
  { accessorKey: 'borrow_date', header: 'Tgl Pinjam' },
  { accessorKey: 'due_date', header: 'Tenggat Waktu' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'fine_status', header: 'Denda' }
]

const getStatusColor = (status: string): 'info' | 'success' | 'error' | 'neutral' => {
  const map: Record<string, 'info' | 'success' | 'error' | 'neutral'> = {
    'BORROWED': 'info',
    'RETURNED': 'success',
    'OVERDUE': 'error',
    'LOST': 'neutral'
  }
  return map[status] || 'neutral'
}

const getFineColor = (status: string): 'neutral' | 'error' | 'success' => {
  const map: Record<string, 'neutral' | 'error' | 'success'> = {
    'NONE': 'neutral',
    'UNPAID': 'error',
    'PAID': 'success'
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
</script>

<template>
  <div class="space-y-4">
    <UTable
      :data="loans"
      :columns="columns"
      :loading="isLoading"
      class="bg-default/80 backdrop-blur rounded-xl border border-default shadow-sm"
    >
      <template #borrow_date-cell="{ row }">
        {{ formatDate((row.original as any).borrow_date) }}
      </template>
      <template #due_date-cell="{ row }">
        {{ formatDate((row.original as any).due_date) }}
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="getStatusColor((row.original as any).status)" variant="subtle">
          {{ (row.original as any).status }}
        </UBadge>
      </template>
      <template #fine_status-cell="{ row }">
        <UBadge :color="getFineColor((row.original as any).fine_status)" variant="subtle">
          {{ (row.original as any).fine_status }}
        </UBadge>
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
