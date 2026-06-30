<script setup lang="ts">
import DashboardUserHomeStatCard from '~/components/dashboard/user/home/StatCard.vue'
import DashboardUserHomeRecentActivity from '~/components/dashboard/user/home/RecentActivity.vue'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Dashboard - Literasiku',
  description: 'Ringkasan aktivitas dan statistik peminjaman Anda.'
})

const { useMeQuery } = useUsers()
const { useMyPhysicalLoans, useMyDigitalLoans } = useLoans()

const { data: user } = useMeQuery()

const page = ref(1)
const limit = ref(100)

const { data: physicalRes, isLoading: physicalLoading } = useMyPhysicalLoans({ page, limit })
const { data: digitalRes, isLoading: digitalLoading } = useMyDigitalLoans({ page, limit })

const physicalLoans = computed(() => physicalRes.value?.data || [])
const digitalLoans = computed(() => digitalRes.value?.data || [])

const isLoading = computed(() => physicalLoading.value || digitalLoading.value)

const activePhysical = computed(() => 
  physicalLoans.value.filter(l => l.status === 'BORROWED').length
)

const activeDigital = computed(() => 
  digitalLoans.value.filter(l => l.access_status === 'ACTIVE').length
)

const totalCompleted = computed(() => 
  physicalLoans.value.filter(l => l.status === 'RETURNED').length
)

const unpaidFines = computed(() => {
  return physicalLoans.value
    .filter(l => l.fine_status === 'UNPAID')
    .reduce((sum, loan) => sum + loan.fine_amount, 0)
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)
}

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 19) return 'Selamat Sore'
  return 'Selamat Malam'
})
</script>

<template>
  <div class="relative isolate overflow-hidden min-h-[calc(100vh-4rem)]">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,var(--ui-primary)/0.14,transparent_30%),radial-gradient(circle_at_82%_10%,var(--ui-secondary)/0.12,transparent_28%),linear-gradient(180deg,var(--ui-bg),var(--ui-bg-muted))]"
    />
    <div
      aria-hidden="true"
      class="bg-grid-soft pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-30"
    />

    <UPageSection
      v-motion
      :initial="{ opacity: 0, y: 28 }"
      :visible-once="{ opacity: 1, y: 0, transition: { duration: 450, ease: 'easeOut' } }"
      :ui="{ root: 'pt-8', header: 'mb-8' }"
    >
      <template #title>
        <span class="text-3xl font-bold tracking-tight text-default">
          {{ greeting }}, <span class="text-primary">{{ user?.full_name?.split(' ')[0] || 'Pembaca' }}</span>!
        </span>
      </template>
      <template #description>
        Pantau koleksi pinjaman dan aktivitas membaca Anda di sini.
      </template>

      <div class="mt-8 space-y-8 max-w-6xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardUserHomeStatCard
            title="Pinjaman Fisik Aktif"
            :value="activePhysical"
            icon="i-lucide-book"
            color="primary"
            description="Buku sedang dipinjam"
            :loading="isLoading"
          />
          <DashboardUserHomeStatCard
            title="Akses Digital Aktif"
            :value="activeDigital"
            icon="i-lucide-smartphone"
            color="secondary"
            description="Buku digital dapat dibaca"
            :loading="isLoading"
          />
          <DashboardUserHomeStatCard
            title="Selesai Dibaca"
            :value="totalCompleted"
            icon="i-lucide-check-circle-2"
            color="success"
            description="Buku telah dikembalikan"
            :loading="isLoading"
          />
          <DashboardUserHomeStatCard
            title="Tagihan Denda"
            :value="unpaidFines > 0 ? formatCurrency(unpaidFines) : 'Rp 0'"
            icon="i-lucide-wallet"
            :color="unpaidFines > 0 ? 'error' : 'neutral'"
            description="Denda belum dibayar"
            :loading="isLoading"
          />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <DashboardUserHomeRecentActivity
              :physical-loans="physicalLoans"
              :digital-loans="digitalLoans"
              :loading="isLoading"
            />
          </div>
          <div class="lg:col-span-1 space-y-6">
            <UCard class="bg-primary-500/10 backdrop-blur border-primary/20 shadow-sm relative overflow-hidden group">
              <div class="absolute -right-8 -top-8 text-primary/10 group-hover:scale-110 transition-transform duration-500">
                <UIcon name="i-lucide-library" class="w-40 h-40" />
              </div>
              <h3 class="text-lg font-bold text-primary mb-2 relative z-10">Temukan Buku Baru!</h3>
              <p class="text-sm text-muted mb-4 relative z-10">
                Jelajahi ratusan koleksi buku terbaru dan pinjam secara instan dari katalog kami.
              </p>
              <UButton
                to="/dashboard/katalog"
                label="Jelajahi Katalog"
                icon="i-lucide-compass"
                color="primary"
                size="md"
                class="relative z-10"
              />
            </UCard>
          </div>
        </div>
      </div>
    </UPageSection>
  </div>
</template>