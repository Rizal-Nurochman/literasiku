<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Laporan & Analitik - Literasiku'
})

const page = ref(1)
const limitList = ref(200)

const { useBooksList } = useBooks()
const { data: booksRes } = useBooksList({ page, limit: ref(1), search: ref('') })

const { total: totalUsers } = useUsers({ page: ref(1), limit: ref(1) })

const { useAllPhysicalLoans, useAllDigitalLoans } = useLoans()
const { data: physicalRes, isLoading: physicalLoading } = useAllPhysicalLoans({
  page,
  limit: limitList,
  status: ref('ALL')
})
const { data: digitalRes, isLoading: digitalLoading } = useAllDigitalLoans({
  page,
  limit: limitList,
  status: ref('ALL')
})

const totalBooks = computed(() => booksRes.value?.total || 0)
const totalMembers = computed(() => totalUsers.value || 0)
const totalPhysical = computed(() => physicalRes.value?.total || 0)
const totalDigital = computed(() => digitalRes.value?.total || 0)

const isLoading = computed(() => physicalLoading.value || digitalLoading.value)

const physicalStats = computed(() => {
  const data = physicalRes.value?.data || []
  return {
    borrowed: data.filter(l => l.status === 'BORROWED').length,
    returned: data.filter(l => l.status === 'RETURNED').length,
    overdue: data.filter(l => l.status === 'OVERDUE').length,
    lost: data.filter(l => l.status === 'LOST').length
  }
})

const digitalStats = computed(() => {
  const data = digitalRes.value?.data || []
  return {
    active: data.filter(l => l.access_status === 'ACTIVE').length,
    expired: data.filter(l => l.access_status === 'EXPIRED').length,
    revoked: data.filter(l => l.access_status === 'REVOKED').length
  }
})

const fineStats = computed(() => {
  const data = physicalRes.value?.data || []
  const unpaid = data.filter(l => l.fine_status === 'UNPAID').reduce((sum, l) => sum + l.fine_amount, 0)
  const paid = data.filter(l => l.fine_status === 'PAID').reduce((sum, l) => sum + l.fine_amount, 0)
  return { unpaid, paid, total: unpaid + paid }
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID')
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

const exportToCSV = () => {
  const phys = (physicalRes.value?.data || []).map(l => ({
    ID: l.id,
    Tipe: 'Fisik',
    Peminjam: l.user_full_name || 'Tidak diketahui',
    Username: l.username || 'unknown',
    Buku: l.book_title,
    'Tanggal Pinjam': formatDate(l.borrow_date),
    'Tanggal Kembali/Batas': formatDate(l.due_date),
    Status: l.status,
    Denda: l.fine_amount,
    'Status Denda': l.fine_status
  }))

  const dig = (digitalRes.value?.data || []).map(l => ({
    ID: l.id,
    Tipe: 'Digital',
    Peminjam: l.user_full_name || 'Tidak diketahui',
    Username: l.username || 'unknown',
    Buku: l.book_title,
    'Tanggal Pinjam': formatDate(l.start_date),
    'Tanggal Kembali/Batas': formatDate(l.end_date),
    Status: l.access_status,
    Denda: 0,
    'Status Denda': '-'
  }))

  const allData = [...phys, ...dig]
  
  if (allData.length === 0) {
    alert('Tidak ada data peminjaman untuk diekspor')
    return
  }

  const headers = Object.keys(allData[0]!)
  const csvRows = [
    headers.join(','),
    ...allData.map(row => 
      headers.map(fieldName => {
        const val = row[fieldName as keyof typeof row]
        const escaped = ('' + val).replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
    )
  ]

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `laporan_sirkulasi_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-default">Laporan & Analitik</h1>
        <p class="text-sm text-muted mt-1">Dapatkan data sirkulasi perpustakaan secara mendalam</p>
      </div>

      <UButton
        color="primary"
        icon="i-lucide-download"
        label="Ekspor Laporan (CSV)"
        @click="exportToCSV"
        :disabled="isLoading"
      />
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-64 bg-default-200/50 rounded-xl animate-pulse" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard class="bg-default/80 backdrop-blur border-default shadow-sm">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-book-copy" class="w-5 h-5 text-primary" />
            <h3 class="font-bold text-default">Status Peminjaman Fisik</h3>
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex justify-between items-center text-sm">
            <span class="text-muted">Total Sirkulasi Fisik</span>
            <span class="font-bold text-default">{{ totalPhysical }}</span>
          </div>

          <div class="space-y-3 pt-2">
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted">
                <span>Sedang Dipinjam (BORROWED)</span>
                <span>{{ physicalStats.borrowed }} ({{ totalPhysical > 0 ? Math.round((physicalStats.borrowed / totalPhysical) * 100) : 0 }}%)</span>
              </div>
              <UProgress :value="totalPhysical > 0 ? (physicalStats.borrowed / totalPhysical) * 100 : 0" color="info" size="sm" />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted">
                <span>Telah Dikembalikan (RETURNED)</span>
                <span>{{ physicalStats.returned }} ({{ totalPhysical > 0 ? Math.round((physicalStats.returned / totalPhysical) * 100) : 0 }}%)</span>
              </div>
              <UProgress :value="totalPhysical > 0 ? (physicalStats.returned / totalPhysical) * 100 : 0" color="success" size="sm" />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted">
                <span>Terlambat (OVERDUE)</span>
                <span>{{ physicalStats.overdue }} ({{ totalPhysical > 0 ? Math.round((physicalStats.overdue / totalPhysical) * 100) : 0 }}%)</span>
              </div>
              <UProgress :value="totalPhysical > 0 ? (physicalStats.overdue / totalPhysical) * 100 : 0" color="error" size="sm" />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted">
                <span>Hilang (LOST)</span>
                <span>{{ physicalStats.lost }} ({{ totalPhysical > 0 ? Math.round((physicalStats.lost / totalPhysical) * 100) : 0 }}%)</span>
              </div>
              <UProgress :value="totalPhysical > 0 ? (physicalStats.lost / totalPhysical) * 100 : 0" color="neutral" size="sm" />
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="bg-default/80 backdrop-blur border-default shadow-sm">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-tablet-smartphone" class="w-5 h-5 text-secondary" />
            <h3 class="font-bold text-default">Status Peminjaman Digital</h3>
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex justify-between items-center text-sm">
            <span class="text-muted">Total Sirkulasi Digital</span>
            <span class="font-bold text-default">{{ totalDigital }}</span>
          </div>

          <div class="space-y-3 pt-2">
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted">
                <span>Akses Aktif (ACTIVE)</span>
                <span>{{ digitalStats.active }} ({{ totalDigital > 0 ? Math.round((digitalStats.active / totalDigital) * 100) : 0 }}%)</span>
              </div>
              <UProgress :value="totalDigital > 0 ? (digitalStats.active / totalDigital) * 100 : 0" color="success" size="sm" />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted">
                <span>Kadaluarsa (EXPIRED)</span>
                <span>{{ digitalStats.expired }} ({{ totalDigital > 0 ? Math.round((digitalStats.expired / totalDigital) * 100) : 0 }}%)</span>
              </div>
              <UProgress :value="totalDigital > 0 ? (digitalStats.expired / totalDigital) * 100 : 0" color="neutral" size="sm" />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted">
                <span>Dicabut (REVOKED)</span>
                <span>{{ digitalStats.revoked }} ({{ totalDigital > 0 ? Math.round((digitalStats.revoked / totalDigital) * 100) : 0 }}%)</span>
              </div>
              <UProgress :value="totalDigital > 0 ? (digitalStats.revoked / totalDigital) * 100 : 0" color="error" size="sm" />
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="bg-default/80 backdrop-blur border-default shadow-sm">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-wallet" class="w-5 h-5 text-error" />
            <h3 class="font-bold text-default">Kinerja Pembayaran Denda</h3>
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex justify-between items-center text-sm">
            <span class="text-muted">Total Akumulasi Denda</span>
            <span class="font-bold text-default">{{ formatCurrency(fineStats.total) }}</span>
          </div>

          <div class="space-y-3 pt-2">
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted">
                <span>Denda Berhasil Terkumpul</span>
                <span>{{ formatCurrency(fineStats.paid) }} ({{ fineStats.total > 0 ? Math.round((fineStats.paid / fineStats.total) * 100) : 100 }}%)</span>
              </div>
              <UProgress :value="fineStats.total > 0 ? (fineStats.paid / fineStats.total) * 100 : 100" color="success" size="sm" />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-xs text-muted">
                <span>Piutang Belum Terbayar</span>
                <span>{{ formatCurrency(fineStats.unpaid) }} ({{ fineStats.total > 0 ? Math.round((fineStats.unpaid / fineStats.total) * 100) : 0 }}%)</span>
              </div>
              <UProgress :value="fineStats.total > 0 ? (fineStats.unpaid / fineStats.total) * 100 : 0" color="error" size="sm" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      <UCard class="bg-default/80 backdrop-blur border-default shadow-sm">
        <template #header>
          <h3 class="font-bold text-default">Ringkasan Operasional</h3>
        </template>
        <div class="divide-y divide-default">
          <div class="py-2 flex justify-between text-sm">
            <span class="text-muted">Total Buku Terdaftar</span>
            <span class="font-bold text-default">{{ totalBooks }}</span>
          </div>
          <div class="py-2 flex justify-between text-sm">
            <span class="text-muted">Total Anggota Terdaftar</span>
            <span class="font-bold text-default">{{ totalMembers }}</span>
          </div>
          <div class="py-2 flex justify-between text-sm">
            <span class="text-muted">Rata-rata Peminjaman per Anggota</span>
            <span class="font-bold text-default">
              {{ totalMembers > 0 ? ((totalPhysical + totalDigital) / totalMembers).toFixed(1) : 0 }} buku
            </span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>