<script setup lang="ts">
import type { RagReferenceMap, SafeRagReference } from '../../../lib/ai/references/types'

type Segment
  = | { type: 'text', value: string }
    | { type: 'reference', value: string, reference?: SafeRagReference }

const props = defineProps<{
  text: string
  references?: RagReferenceMap | Record<string, SafeRagReference>
}>()

const segments = computed<Segment[]>(() => {
  const output: Segment[] = []
  const regex = /⟦(S\d+|M\d+)⟧/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(props.text)) !== null) {
    if (match.index > lastIndex) {
      output.push({ type: 'text', value: props.text.slice(lastIndex, match.index) })
    }

    const referenceId = match[1]

    if (referenceId) {
      const reference = props.references?.[referenceId] as SafeRagReference | undefined

      if (reference) output.push({ type: 'reference', value: referenceId, reference })
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < props.text.length) output.push({ type: 'text', value: props.text.slice(lastIndex) })

  return output
})
</script>

<template>
  <span class="whitespace-pre-wrap">
    <template
      v-for="(segment, index) in segments"
      :key="index"
    >
      <template v-if="segment.type === 'text'">{{ segment.value }}</template>
      <AiReferenceChip
        v-else
        :reference-id="segment.value"
        :reference="segment.reference"
      />
    </template>
  </span>
</template>
