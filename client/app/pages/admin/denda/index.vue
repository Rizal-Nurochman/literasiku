<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Manajemen Denda - Literasiku'
})

const page = ref(1)
const limit = ref(200)
const statusFilter = ref('ALL')

const statusOptions = [
  { label: 'Semua Status Denda', value: 'ALL' },
  { label: 'Belum Dibayar (UNPAID)', value: 'UNPAID' },
  { label: 'Sudah Dibayar (PAID)', value: 'PAID' }
]

const { useAllPhysicalLoans, payFineMutation } = useLoans()
const { data, isLoading } = useAllPhysicalLoans({ page, limit, status: ref('ALL') })

const fines = computed(() => {
  const allLoans = data.value?.data || []
  const withFines = allLoans.filter(l => l.fine_amount > 0)
  
  if (statusFilter.value === 'ALL') {
    return withFines
  }
  return withFines.filter(l => l.fine_status === statusFilter.value)
})

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { id: 'user', header: 'Peminjam' },
  { accessorKey: 'book_title', header: 'Buku' },
  { accessorKey: 'due_date', header: 'Batas Tenggat' },
  { accessorKey: 'return_date', header: 'Tgl Pengembalian' },
  { id: 'fine', header: 'Denda' },
  { id: 'actions', header: '' }
]

const getFineColor = (status: string): 'neutral' | 'error' | 'success' => {
  if (status === 'UNPAID') return 'error'
  if (status === 'PAID') return 'success'
  return 'neutral'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID')
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

const payFine = (id: number) => {
  if (confirm('Apakah Anda yakin ingin memproses pembayaran denda ini secara tunai?')) {
    payFineMutation.mutate(id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-default">Manajemen Denda</h1>
        <p class="text-sm text-muted mt-1">Pantau dan verifikasi pembayaran denda keterlambatan buku fisik</p>
      </div>
    </div>

    <UCard class="bg-default/80 backdrop-blur border-default shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-2">
          <USelect
            v-model="statusFilter"
            :items="statusOptions"
            class="w-56"
          />
        </div>
      </div>

      <UTable
        :data="fines"
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
        <template #due_date-cell="{ row }">
          <span class="text-sm">{{ formatDate((row.original as any).due_date) }}</span>
        </template>
        <template #return_date-cell="{ row }">
          <span class="text-sm">{{ formatDate((row.original as any).return_date) }}</span>
        </template>
        <template #fine-cell="{ row }">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-semibold text-default">{{ formatCurrency((row.original as any).fine_amount) }}</span>
            <UBadge :color="getFineColor((row.original as any).fine_status)" variant="subtle" size="xs">
              {{ (row.original as any).fine_status }}
            </UBadge>
          </div>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2 justify-end">
            <UTooltip text="Konfirmasi Pembayaran Denda" v-if="(row.original as any).fine_status === 'UNPAID'">
              <UButton
                color="success"
                variant="soft"
                icon="i-lucide-badge-dollar-sign"
                size="xs"
                label="Bayar"
                @click="payFine((row.original as any).id)"
                :loading="payFineMutation.isPending.value"
              />
            </UTooltip>
          </div>
        </template>
      </UTable>

      <div class="flex items-center justify-between mt-6" v-if="fines.length > 0">
        <span class="text-sm text-muted">Total {{ fines.length }} data denda</span>
      </div>
    </UCard>
  </div>
</template>
