<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))

const { useBookDetail } = useBooks()
const { borrowPhysicalMutation, borrowDigitalMutation } = useLoans()

const { data: book, isLoading } = useBookDetail(id)

const preferredMotion = usePreferredReducedMotion()
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')
const duration = computed(() => shouldReduceMotion.value ? 0 : 450)

const onBorrowPhysical = () => {
  if (!book.value) return
  borrowPhysicalMutation.mutate({
    book_id: book.value.id
  }, {
    onSuccess: () => {
      router.push('/dashboard/riwayat')
    }
  })
}

const onBorrowDigital = () => {
  if (!book.value) return
  borrowDigitalMutation.mutate({
    book_id: book.value.id
  }, {
    onSuccess: () => {
      router.push('/dashboard/riwayat')
    }
  })
}

const goToKatalog = () => {
  router.push('/dashboard/katalog')
}
</script>

<template>
  <div class="relative isolate overflow-hidden min-h-[calc(100vh-4rem)] pb-12">
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
      :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
      :ui="{ root: 'pt-8', header: 'mb-8' }"
    >
      <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
      </div>
      
      <div v-else-if="book" class="max-w-4xl mx-auto space-y-8">
        <UButton
          icon="i-lucide-arrow-left"
          label="Kembali ke Katalog"
          variant="ghost"
          color="neutral"
          @click="goToKatalog"
        />

        <UCard class="border-default/80 bg-default/80 shadow-xl shadow-primary/5 backdrop-blur">
          <div class="grid md:grid-cols-[1fr_2fr] gap-8">
            <div class="space-y-4">
              <div class="relative flex aspect-3/4 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-primary/20 via-default to-secondary/20">
                <div class="absolute inset-0 bg-grid-soft opacity-50" />
                <UIcon name="i-lucide-book-marked" class="size-16 text-primary drop-shadow-lg" />
              </div>
              
              <div class="flex flex-col gap-2 mt-4">
                <UButton
                  v-if="book.is_digital_available"
                  label="Baca Digital"
                  color="primary"
                  icon="i-lucide-book-open"
                  block
                  :loading="borrowDigitalMutation.isPending.value"
                  @click="onBorrowDigital"
                />
                
                <UButton
                  v-if="book.physical_stock > 0"
                  label="Ajukan Pinjam Fisik"
                  color="neutral"
                  variant="subtle"
                  icon="i-lucide-handshake"
                  block
                  :loading="borrowPhysicalMutation.isPending.value"
                  @click="onBorrowPhysical"
                />
                
                <UAlert
                  v-if="book.physical_stock === 0 && !book.is_digital_available"
                  color="warning"
                  variant="subtle"
                  title="Buku Tidak Tersedia"
                  description="Buku ini sedang tidak tersedia dalam format fisik maupun digital."
                />
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <h1 class="text-3xl font-bold tracking-tight text-highlighted">{{ book.title }}</h1>
                <p class="text-lg text-muted mt-2">Karya {{ book.author }}</p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge color="primary" variant="subtle">{{ book.category_id }}</UBadge>
                <UBadge v-if="book.physical_stock > 0" color="success" variant="subtle">Fisik Tersedia ({{ book.physical_stock }})</UBadge>
                <UBadge v-else color="error" variant="subtle">Fisik Kosong</UBadge>
                <UBadge v-if="book.is_digital_available" color="info" variant="subtle">Digital Tersedia</UBadge>
              </div>

              <div class="prose dark:prose-invert max-w-none">
                <h3>Informasi Detail</h3>
                <ul class="space-y-2">
                  <li><strong>Penerbit:</strong> {{ book.publisher || '-' }}</li>
                  <li><strong>Tahun Terbit:</strong> {{ book.year_published || '-' }}</li>
                  <li><strong>ISBN:</strong> <span class="font-mono text-sm">{{ book.isbn || '-' }}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <div v-else class="text-center py-12">
        <h2 class="text-2xl font-bold">Buku Tidak Ditemukan</h2>
        <UButton
          class="mt-4"
          label="Kembali ke Katalog"
          @click="goToKatalog"
        />
      </div>
    </UPageSection>
  </div>
</template>
