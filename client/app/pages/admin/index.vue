<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

useSeoMeta({
  title: 'Dashboard Admin - Literasiku'
})

const page = ref(1)
const limitSingle = ref(1)
const limitList = ref(200)

const { useBooksList } = useBooks()
const { data: booksRes, isLoading: booksLoading } = useBooksList({
  page,
  limit: limitSingle,
  search: ref('')
})

const userPage = ref(1)
const userLimit = ref(1)
const { total: totalUsers, isLoading: usersLoading } = useUsers({
  page: userPage,
  limit: userLimit
})

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

const activePhysical = computed(() => {
  return (physicalRes.value?.data || []).filter(l => l.status === 'BORROWED' || l.status === 'OVERDUE').length
})

const activeDigital = computed(() => {
  return (digitalRes.value?.data || []).filter(l => l.access_status === 'ACTIVE').length
})

const unpaidFines = computed(() => {
  return (physicalRes.value?.data || [])
    .filter(l => l.fine_status === 'UNPAID')
    .reduce((sum, l) => sum + l.fine_amount, 0)
})

const collectedFines = computed(() => {
  return (physicalRes.value?.data || [])
    .filter(l => l.fine_status === 'PAID')
    .reduce((sum, l) => sum + l.fine_amount, 0)
})

const isLoading = computed(() => booksLoading.value || usersLoading.value || physicalLoading.value || digitalLoading.value)

const recentActivities = computed(() => {
  const phys = (physicalRes.value?.data || []).map(l => ({
    id: `P-${l.id}`,
    user: l.user_full_name || 'Anggota',
    book: l.book_title,
    type: 'Fisik',
    date: l.borrow_date,
    status: l.status,
    rawDate: new Date(l.borrow_date)
  }))
  const dig = (digitalRes.value?.data || []).map(l => ({
    id: `D-${l.id}`,
    user: l.user_full_name || 'Anggota',
    book: l.book_title,
    type: 'Digital',
    date: l.start_date,
    status: l.access_status,
    rawDate: new Date(l.start_date)
  }))

  return [...phys, ...dig]
    .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
    .slice(0, 5)
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-8 relative isolate overflow-hidden min-h-[calc(100vh-4rem)]">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,var(--ui-primary)/0.14,transparent_30%),radial-gradient(circle_at_82%_10%,var(--ui-secondary)/0.12,transparent_28%),linear-gradient(180deg,var(--ui-bg),var(--ui-bg-muted))]"
    />
    <div
      aria-hidden="true"
      class="bg-grid-soft pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-30"
    />

    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-default">Selamat Datang, Admin</h1>
        <p class="text-sm text-muted mt-1">Panel kontrol pengawasan operasional dan sirkulasi Literasiku</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard class="bg-default/80 backdrop-blur border-default shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 text-primary/10 group-hover:scale-110 transition-transform duration-500">
          <UIcon name="i-lucide-book-open" class="w-24 h-24" />
        </div>
        <div class="space-y-2 relative z-10">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">Total Koleksi Buku</p>
          <div class="flex items-baseline gap-2">
            <span v-if="isLoading" class="text-3xl font-bold animate-pulse">...</span>
            <span v-else class="text-3xl font-black text-default">{{ totalBooks }}</span>
            <span class="text-xs text-muted">judul terdaftar</span>
          </div>
        </div>
      </UCard>

      <UCard class="bg-default/80 backdrop-blur border-default shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 text-secondary/10 group-hover:scale-110 transition-transform duration-500">
          <UIcon name="i-lucide-users" class="w-24 h-24" />
        </div>
        <div class="space-y-2 relative z-10">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">Total Anggota</p>
          <div class="flex items-baseline gap-2">
            <span v-if="isLoading" class="text-3xl font-bold animate-pulse">...</span>
            <span v-else class="text-3xl font-black text-default">{{ totalMembers }}</span>
            <span class="text-xs text-muted">pembaca aktif</span>
          </div>
        </div>
      </UCard>

      <UCard class="bg-default/80 backdrop-blur border-default shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 text-info/10 group-hover:scale-110 transition-transform duration-500">
          <UIcon name="i-lucide-book-copy" class="w-24 h-24" />
        </div>
        <div class="space-y-2 relative z-10">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">Peminjaman Aktif</p>
          <div class="flex items-baseline gap-2">
            <span v-if="isLoading" class="text-3xl font-bold animate-pulse">...</span>
            <span v-else class="text-3xl font-black text-default">{{ activePhysical + activeDigital }}</span>
            <span class="text-xs text-muted">({{ activePhysical }} fisik, {{ activeDigital }} digital)</span>
          </div>
        </div>
      </UCard>

      <UCard class="bg-default/80 backdrop-blur border-default shadow-sm relative overflow-hidden group">
        <div class="absolute -right-4 -top-4 text-error/10 group-hover:scale-110 transition-transform duration-500">
          <UIcon name="i-lucide-wallet" class="w-24 h-24" />
        </div>
        <div class="space-y-2 relative z-10">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">Piutang Denda</p>
          <div class="flex items-baseline gap-2">
            <span v-if="isLoading" class="text-3xl font-bold animate-pulse">...</span>
            <span v-else class="text-2xl font-black text-error">{{ formatCurrency(unpaidFines) }}</span>
            <span class="text-xs text-muted">belum dibayar</span>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <UCard class="lg:col-span-2 bg-default/80 backdrop-blur border-default shadow-sm">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-default">Aktivitas Sirkulasi Terbaru</h2>
            <div class="flex gap-2">
              <UButton to="/admin/peminjaman/fisik" label="Fisik" size="xs" variant="ghost" />
              <UButton to="/admin/peminjaman/digital" label="Digital" size="xs" variant="ghost" />
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div v-if="isLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-12 bg-default-200/50 rounded-lg animate-pulse" />
          </div>
          <div v-else-if="recentActivities.length === 0" class="text-center py-8 text-muted text-sm">
            Belum ada aktivitas sirkulasi saat ini.
          </div>
          <div v-else class="divide-y divide-default">
            <div v-for="act in recentActivities" :key="act.id" class="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
              <div class="flex items-center gap-3">
                <UAvatar
                  :alt="act.user"
                  size="sm"
                  class="bg-primary/10 text-primary text-xs font-bold"
                />
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-default line-clamp-1">{{ act.user }}</span>
                  <span class="text-xs text-muted line-clamp-1">meminjam {{ act.book }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <UBadge :color="act.type === 'Fisik' ? 'info' : 'secondary'" variant="subtle" size="xs">
                  {{ act.type }}
                </UBadge>
                <span class="text-xs text-muted">{{ formatDate(act.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="bg-default/80 backdrop-blur border-default shadow-sm flex flex-col justify-between">
        <template #header>
          <h2 class="text-lg font-bold text-default">Ikhtisar Perpustakaan</h2>
        </template>

        <div class="space-y-6 my-auto">
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted">Rasio Sirkulasi (Fisik vs Digital)</span>
              <span class="font-semibold text-default">{{ totalPhysical }} : {{ totalDigital }}</span>
            </div>
            <UProgress
              :value="totalPhysical + totalDigital > 0 ? (totalPhysical / (totalPhysical + totalDigital)) * 100 : 50"
              color="primary"
              size="md"
            />
            <div class="flex justify-between text-[10px] text-muted">
              <span>Fisik ({{ totalPhysical }})</span>
              <span>Digital ({{ totalDigital }})</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted">Persentase Denda Terbayar</span>
              <span class="font-semibold text-default">
                {{ unpaidFines + collectedFines > 0 ? Math.round((collectedFines / (unpaidFines + collectedFines)) * 100) : 100 }}%
              </span>
            </div>
            <UProgress
              :value="unpaidFines + collectedFines > 0 ? (collectedFines / (unpaidFines + collectedFines)) * 100 : 100"
              color="success"
              size="md"
            />
            <div class="flex justify-between text-[10px] text-muted">
              <span>Lunas ({{ formatCurrency(collectedFines) }})</span>
              <span>Tunggakan ({{ formatCurrency(unpaidFines) }})</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>