<script setup lang="ts">
import type { SafeRagReference } from '../../../lib/ai/references/types'

const props = defineProps<{
  reference?: SafeRagReference
}>()

const score = computed(() => typeof props.reference?.score === 'number' ? props.reference.score.toFixed(2) : '-')
const title = computed(() => props.reference?.title || props.reference?.fileName || props.reference?.sourceId || 'Referensi')
</script>

<template>
  <div class="w-80 space-y-3 p-3">
    <div class="space-y-1">
      <p class="text-sm font-semibold text-highlighted">
        {{ title }}
      </p>
      <div class="flex flex-wrap gap-2 text-xs text-muted">
        <span>{{ reference?.page ? `Halaman ${reference.page}` : 'Halaman tidak tersedia' }}</span>
        <span v-if="reference?.chunkIndex !== undefined">Chunk {{ reference.chunkIndex }}</span>
        <span>Score {{ score }}</span>
      </div>
    </div>

    <p class="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-toned">
      {{ reference?.quote || 'Referensi tidak tersedia.' }}
    </p>

    <UButton
      v-if="reference?.sourceId"
      :to="`/sources/${reference.sourceId}`"
      size="xs"
      color="neutral"
      variant="subtle"
      icon="i-lucide-external-link"
    >
      Lihat sumber
    </UButton>
  </div>
</template>
