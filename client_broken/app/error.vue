<script setup lang="ts">
import type { NuxtError } from '#app'
import { useRafFn, useMouseInElement } from '@vueuse/core'

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })

const target = ref<HTMLElement | null>(null)
const { elementX, elementY, elementWidth, elementHeight } = useMouseInElement(target)

const posX = ref(0)
const posY = ref(0)

useRafFn(() => {
  const targetX = (elementX.value / elementWidth.value - 0.5) * 50
  const targetY = (elementY.value / elementHeight.value - 0.5) * 50
  
  posX.value += (targetX - posX.value) * 0.05
  posY.value += (targetY - posY.value) * 0.05
})
</script>

<template>
  <div ref="target" class="relative flex min-h-screen items-center justify-center overflow-hidden bg-default">
    <div class="aurora-root absolute inset-0 -z-10">
      <div class="aurora-field absolute inset-0" />
      <div 
        class="aurora-orb-track absolute top-1/2 left-1/2 size-[30rem] blur-3xl transition-transform duration-75"
        :style="{ transform: `translate3d(calc(-50% + ${posX}px), calc(-50% + ${posY}px), 0)` }"
      >
        <div class="size-full rounded-full bg-primary/20" />
      </div>
      <div class="aurora-noise absolute inset-0 opacity-[0.04]" />
      <div class="aurora-vignette absolute inset-0" />
    </div>

    <div class="z-10 flex flex-col items-center gap-8 p-6 text-center animate-in fade-in zoom-in duration-700">
      <div class="space-y-2">
        <h1 class="text-[12rem] font-black leading-none tracking-tighter text-primary/10 select-none">
          {{ error?.statusCode || 500 }}
        </h1>
        <h2 class="text-3xl font-bold text-highlighted">
          {{ error?.statusCode === 404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan' }}
        </h2>
      </div>

      <p class="max-w-md text-muted leading-relaxed">
        {{ error?.message || 'Kami tidak dapat menemukan halaman yang Anda cari. Silakan kembali ke beranda untuk melanjutkan eksplorasi.' }}
      </p>

      <UButton
        size="xl"
        color="primary"
        variant="solid"
        label="Kembali ke Beranda"
        icon="i-lucide-arrow-left"
        class="hover:scale-105 transition-transform"
        @click="handleError"
      />
    </div>
  </div>
</template>

<style scoped>
.aurora-root {
  background: var(--ui-bg);
}

.aurora-field {
  background:
    radial-gradient(circle at 20% 30%, color-mix(in oklab, var(--ui-primary) 20%, transparent), transparent 40%),
    radial-gradient(circle at 80% 70%, color-mix(in oklab, var(--ui-secondary) 20%, transparent), transparent 40%);
  animation: aurora-shift 20s ease-in-out infinite alternate;
}

.aurora-noise {
  background-image:
    radial-gradient(circle at 20% 30%, currentColor 0.5px, transparent 0.5px),
    radial-gradient(circle at 80% 70%, currentColor 0.5px, transparent 0.5px);
  background-size: 30px 30px;
  color: var(--ui-primary);
}

.aurora-vignette {
  background: radial-gradient(circle at center, transparent 0%, var(--ui-bg) 100%);
}

@keyframes aurora-shift {
  0% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1.2) rotate(5deg); }
}

@media (prefers-reduced-motion: reduce) {
  .aurora-field { animation: none; }
}
</style>