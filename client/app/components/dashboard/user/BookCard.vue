<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import type { BookResponse } from '#shared/types/books'

const props = defineProps<{
  book: BookResponse
  index: number
}>()

const router = useRouter()
const preferredMotion = usePreferredReducedMotion()
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')
const duration = computed(() => shouldReduceMotion.value ? 0 : 450)

const goToDetail = () => {
  router.push(`/dashboard/katalog/${props.book.id}`)
}
</script>

<template>
  <UCard
    v-motion
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : index * 70, ease: 'easeOut' } }"
    class="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 cursor-pointer flex flex-col"
    @click="goToDetail"
  >
    <div class="space-y-5 flex-1 flex flex-col">
      <div class="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-primary/20 via-default to-secondary/20 shrink-0">
        <div class="absolute inset-0 bg-grid-soft opacity-50" />
        <div class="relative flex size-20 items-center justify-center rounded-2xl bg-default/85 text-primary shadow-lg backdrop-blur transition-transform duration-300 group-hover:scale-105">
          <UIcon
            name="i-lucide-book-marked"
            class="size-9"
          />
        </div>
      </div>

      <div class="flex-1">
        <h2 class="text-lg font-semibold text-highlighted line-clamp-2">
          {{ book.title }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-muted line-clamp-2">
          Karya {{ book.author }} | {{ book.publisher }} ({{ book.year_published }})
        </p>
      </div>

      <div class="flex flex-wrap gap-2 shrink-0 mt-4">
        <UBadge
          v-if="book.physical_stock > 0"
          color="success"
          variant="subtle"
          label="Fisik Tersedia"
        />
        <UBadge
          v-else
          color="neutral"
          variant="subtle"
          label="Fisik Kosong"
        />
        <UBadge
          v-if="book.is_digital_available"
          color="info"
          variant="subtle"
          label="Digital Tersedia"
        />
      </div>

      <div class="flex flex-wrap gap-2 shrink-0">
        <UButton
          label="Lihat Detail"
          color="neutral"
          variant="soft"
          icon="i-lucide-eye"
          size="sm"
          class="w-full"
        />
      </div>
    </div>
  </UCard>
</template>
