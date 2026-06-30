<script setup lang="ts">
import type { LoanResponse, DigitalLoanResponse } from '#shared/types/loans'

const props = defineProps<{
  physicalLoans: LoanResponse[]
  digitalLoans: DigitalLoanResponse[]
  loading?: boolean
}>()

const activities = computed(() => {
  const combined = [
    ...props.physicalLoans.map(loan => ({
      id: `p-${loan.id}`,
      type: 'Fisik',
      title: loan.book_title,
      date: new Date(loan.borrow_date),
      status: loan.status,
      color: getPhysicalStatusColor(loan.status)
    })),
    ...props.digitalLoans.map(loan => ({
      id: `d-${loan.id}`,
      type: 'Digital',
      title: loan.book_title,
      date: new Date(loan.start_date),
      status: loan.access_status,
      color: getDigitalStatusColor(loan.access_status)
    }))
  ]

  return combined.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)
})

const getPhysicalStatusColor = (status: string) => {
  const map: Record<string, string> = {
    'BORROWED': 'info',
    'RETURNED': 'success',
    'OVERDUE': 'error',
    'LOST': 'neutral'
  }
  return map[status] || 'neutral'
}

const getDigitalStatusColor = (status: string) => {
  const map: Record<string, string> = {
    'ACTIVE': 'success',
    'EXPIRED': 'neutral',
    'REVOKED': 'error'
  }
  return map[status] || 'neutral'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <UCard class="bg-default/80 backdrop-blur border-default shadow-sm">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-default">Aktivitas Terbaru</h3>
        <UButton
          to="/dashboard/riwayat"
          label="Lihat Semua"
          variant="ghost"
          color="primary"
          size="xs"
          icon="i-lucide-arrow-right"
          trailing
        />
      </div>
    </template>

    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-primary" />
    </div>
    <div v-else-if="activities.length === 0" class="text-center py-8">
      <UIcon name="i-lucide-inbox" class="w-12 h-12 text-muted mx-auto mb-3" />
      <p class="text-sm text-muted">Belum ada aktivitas peminjaman.</p>
    </div>
    <div v-else class="space-y-4">
      <div v-for="activity in activities" :key="activity.id" class="flex items-center gap-4">
        <div class="shrink-0">
          <div v-if="activity.type === 'Fisik'" class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UIcon name="i-lucide-book" class="w-5 h-5" />
          </div>
          <div v-else class="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <UIcon name="i-lucide-smartphone" class="w-5 h-5" />
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-default truncate">{{ activity.title }}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-xs text-muted">{{ formatDate(activity.date) }}</span>
            <span class="text-xs text-muted">&bull;</span>
            <span class="text-xs text-muted">Pinjaman {{ activity.type }}</span>
          </div>
        </div>
        
        <UBadge :color="activity.color as any" variant="subtle" size="sm">
          {{ activity.status }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>
