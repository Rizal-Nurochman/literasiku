<script setup lang="ts">
import type { SafeRagReference } from '../../../lib/ai/references/types'

const props = defineProps<{
  referenceId: string
  reference?: SafeRagReference
}>()

const label = computed(() => props.referenceId.replace(/[⟦⟧]/g, ''))
</script>

<template>
  <UPopover mode="hover">
    <UButton
      size="xs"
      color="primary"
      variant="soft"
      class="mx-0.5 align-baseline text-[11px]"
      :aria-label="`Lihat referensi ${label}`"
    >
      {{ label }}
    </UButton>

    <template #content>
      <AiReferenceHoverCard :reference="reference" />
    </template>
  </UPopover>
</template>
