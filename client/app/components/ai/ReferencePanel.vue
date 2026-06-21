<script setup lang="ts">
import type { RagReferenceMap, SafeRagReference } from '../../../lib/ai/references/types'

const props = defineProps<{
  references?: RagReferenceMap | Record<string, SafeRagReference>
}>()

const items = computed(() => Object.values(props.references ?? {}) as SafeRagReference[])
</script>

<template>
  <UCollapsible
    v-if="items.length"
    class="mt-3"
  >
    <UButton
      color="neutral"
      variant="subtle"
      size="sm"
      icon="i-lucide-list-tree"
    >
      Referensi jawaban ({{ items.length }})
    </UButton>

    <template #content>
      <div class="mt-3 space-y-2">
        <div
          v-for="reference in items"
          :key="reference.referenceId"
          class="rounded-lg border border-default bg-default/40 p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold">
                {{ reference.referenceId }} · {{ reference.title || reference.fileName || reference.sourceId }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ reference.page ? `Halaman ${reference.page}` : 'Halaman tidak tersedia' }} · Chunk {{ reference.chunkIndex ?? '-' }} · Score {{ typeof reference.score === 'number' ? reference.score.toFixed(2) : '-' }}
              </p>
            </div>

            <UButton
              :to="`/sources/${reference.sourceId}`"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-external-link"
            />
          </div>

          <p class="mt-2 text-xs leading-5 text-toned">
            {{ reference.preview || reference.quote }}
          </p>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>
