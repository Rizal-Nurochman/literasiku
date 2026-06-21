<script setup lang="ts">
const route = useRoute()
const sourceId = computed(() => String(route.params.sourceId))
const { data, pending, error } = await useFetch(() => `/api/sources/${sourceId.value}`)
</script>

<template>
  <UPageSection>
    <div class="mx-auto max-w-4xl space-y-4">
      <UButton
        to="/"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
      >
        Kembali
      </UButton>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <h1 class="text-xl font-semibold">
              {{ data?.title || data?.fileName || sourceId }}
            </h1>
            <p class="text-sm text-muted">
              {{ data?.mimeType || 'Source detail' }}
            </p>
          </div>
        </template>

        <div
          v-if="pending"
          class="py-8 text-center text-muted"
        >
          Memuat sumber...
        </div>
        <div
          v-else-if="error"
          class="py-8 text-center text-error"
        >
          Sumber tidak bisa dimuat.
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="chunk in data?.chunks || []"
            :key="`${chunk.page || 'x'}-${chunk.chunkIndex}`"
            class="rounded-lg border border-default p-3"
          >
            <p class="mb-2 text-xs text-muted">
              {{ chunk.page ? `Halaman ${chunk.page}` : 'Halaman tidak tersedia' }} · Chunk {{ chunk.chunkIndex ?? '-' }}
            </p>
            <p class="whitespace-pre-wrap text-sm leading-6">
              {{ chunk.content }}
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </UPageSection>
</template>
