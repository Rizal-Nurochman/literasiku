<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Manajemen Peminjaman Fisik - Literasiku'
})

const page = ref(1)
const limit = ref(10)
const status = ref('ALL')

const statusOptions = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'BORROWED', value: 'BORROWED' },
  { label: 'RETURNED', value: 'RETURNED' },
  { label: 'OVERDUE', value: 'OVERDUE' },
  { label: 'LOST', value: 'LOST' }
]

const { useAllPhysicalLoans, returnPhysicalMutation, payFineMutation } = useLoans()
const { data, isLoading } = useAllPhysicalLoans({ page, limit, status })
const loans = computed(() => data.value?.data || [])
const total = computed(() => data.value?.total || 0)

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { id: 'user', header: 'Peminjam' },
  { accessorKey: 'book_title', header: 'Buku' },
  { accessorKey: 'borrow_date', header: 'Tgl Pinjam' },
  { accessorKey: 'due_date', header: 'Tenggat' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'fine', header: 'Denda' },
  { id: 'actions', header: '' }
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

const isReturnOpen = ref(false)
const selectedLoanId = ref<number | null>(null)
const returnDateInput = ref('')

const openReturnModal = (id: number) => {
  selectedLoanId.value = id
  returnDateInput.value = new Date().toISOString().split('T')[0]!
  isReturnOpen.value = true
}

const submitReturn = () => {
  if (!selectedLoanId.value) return
  returnPhysicalMutation.mutate({
    id: selectedLoanId.value,
    data: { return_date: returnDateInput.value }
  })
  isReturnOpen.value = false
}

const payFine = (id: number) => {
  payFineMutation.mutate(id)
}

const toggleIsReturnOpen = () => {
  isReturnOpen.value = !isReturnOpen.value
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-default">Peminjaman Fisik</h1>
        <p class="text-sm text-muted mt-1">Kelola sirkulasi buku fisik perpustakaan</p>
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
        <template #borrow_date-cell="{ row }">
          <span class="text-sm">{{ formatDate((row.original as any).borrow_date) }}</span>
        </template>
        <template #due_date-cell="{ row }">
          <span class="text-sm">{{ formatDate((row.original as any).due_date) }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="getStatusColor((row.original as any).status)" variant="subtle" size="sm">
            {{ (row.original as any).status }}
          </UBadge>
        </template>
        <template #fine-cell="{ row }">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium">{{ formatCurrency((row.original as any).fine_amount) }}</span>
            <UBadge v-if="(row.original as any).fine_amount > 0" :color="getFineColor((row.original as any).fine_status)" variant="subtle" size="xs">
              {{ (row.original as any).fine_status }}
            </UBadge>
          </div>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2 justify-end">
            <UTooltip text="Kembalikan Buku" v-if="['BORROWED', 'OVERDUE'].includes((row.original as any).status)">
              <UButton
                color="primary"
                variant="soft"
                icon="i-lucide-arrow-down-to-line"
                size="xs"
                @click="openReturnModal((row.original as any).id)"
                :loading="returnPhysicalMutation.isPending.value"
              />
            </UTooltip>
            <UTooltip text="Bayar Denda" v-if="(row.original as any).fine_status === 'UNPAID'">
              <UButton
                color="success"
                variant="soft"
                icon="i-lucide-badge-dollar-sign"
                size="xs"
                @click="payFine((row.original as any).id)"
                :loading="payFineMutation.isPending.value"
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

    <UModal v-model="isReturnOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-default">
              Proses Pengembalian Buku
            </h3>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="-my-1" @click="toggleIsReturnOpen" />
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-muted">Secara default, buku akan dikembalikan sesuai tanggal hari ini. Anda dapat menyesuaikan tanggal pengembalian jika buku dikembalikan di masa lalu.</p>
          <UFormField label="Tanggal Dikembalikan">
            <UInput type="date" v-model="returnDateInput" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton label="Batal" color="neutral" variant="ghost" @click="toggleIsReturnOpen" />
            <UButton label="Konfirmasi" color="primary" @click="submitReturn" :loading="returnPhysicalMutation.isPending.value" />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
