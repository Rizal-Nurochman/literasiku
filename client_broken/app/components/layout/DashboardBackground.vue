<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

const preferredMotion = usePreferredReducedMotion()
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')

const backgroundRef = ref<HTMLElement | null>(null)

let frameId: number | null = null
let targetX = 0.5
let targetY = 0.4
let currentX = 0.5
let currentY = 0.4

const setBackgroundVariables = (x: number, y: number) => {
  if (!backgroundRef.value) return

  const offsetX = (x - 0.5) * 24
  const offsetY = (y - 0.5) * 18

  backgroundRef.value.style.setProperty('--cursor-x', `${(x * 100).toFixed(2)}%`)
  backgroundRef.value.style.setProperty('--cursor-y', `${(y * 100).toFixed(2)}%`)
  backgroundRef.value.style.setProperty('--move-x', `${offsetX.toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-y', `${offsetY.toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-x-reverse', `${(-offsetX).toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-y-reverse', `${(-offsetY).toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-x-soft', `${(offsetX * 0.4).toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-y-soft', `${(offsetY * 0.4).toFixed(2)}px`)
}

const animateBackground = () => {
  currentX += (targetX - currentX) * 0.04
  currentY += (targetY - currentY) * 0.04

  setBackgroundVariables(currentX, currentY)
  frameId = window.requestAnimationFrame(animateBackground)
}

const startBackgroundAnimation = () => {
  if (frameId !== null || shouldReduceMotion.value || !import.meta.client) return
  frameId = window.requestAnimationFrame(animateBackground)
}

const stopBackgroundAnimation = () => {
  if (frameId === null || !import.meta.client) return
  window.cancelAnimationFrame(frameId)
  frameId = null
}

const handlePointerMove = (event: PointerEvent) => {
  if (shouldReduceMotion.value || event.pointerType === 'touch') return
  targetX = event.clientX / window.innerWidth
  targetY = event.clientY / window.innerHeight
}

const resetBackground = () => {
  targetX = 0.5
  targetY = 0.4
}

onMounted(() => {
  if (shouldReduceMotion.value) return

  setBackgroundVariables(currentX, currentY)
  startBackgroundAnimation()

  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('blur', resetBackground)
})

onBeforeUnmount(() => {
  stopBackgroundAnimation()
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('blur', resetBackground)
})
</script>

<template>
  <div
    ref="backgroundRef"
    aria-hidden="true"
    class="dash-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    <div class="dash-field absolute inset-0" />

    <div class="dash-cursor absolute inset-0" />

    <div class="dash-orb-track dash-track-primary absolute -left-20 -top-8 size-[32rem]">
      <div class="dash-orb dash-orb-primary size-full rounded-full blur-3xl" />
    </div>

    <div class="dash-orb-track dash-track-secondary absolute -right-20 top-16 size-[28rem]">
      <div class="dash-orb dash-orb-secondary size-full rounded-full blur-3xl" />
    </div>

    <div class="dash-dot-grid absolute inset-0" />

    <div class="dash-noise absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" />

    <div class="dash-vignette absolute inset-0" />

    <div class="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-default to-transparent" />

    <div class="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-default via-default/70 to-transparent" />
  </div>
</template>

<style scoped>
.dash-bg {
  --cursor-x: 50%;
  --cursor-y: 40%;
  --move-x: 0px;
  --move-y: 0px;
  --move-x-reverse: 0px;
  --move-y-reverse: 0px;
  --move-x-soft: 0px;
  --move-y-soft: 0px;
}

.dash-field {
  background:
    radial-gradient(circle at 10% 6%, color-mix(in oklab, var(--ui-primary) 11%, transparent), transparent 26%),
    radial-gradient(circle at 92% 8%, color-mix(in oklab, var(--ui-secondary) 9%, transparent), transparent 24%),
    radial-gradient(circle at 50% 70%, color-mix(in oklab, #22d3ee 5%, transparent), transparent 30%),
    linear-gradient(180deg, var(--ui-bg), transparent 48%, var(--ui-bg));
  background-size: 115% 115%, 115% 115%, 130% 130%, 100% 100%;
  animation: dash-shift 38s ease-in-out infinite alternate;
  will-change: background-position;
}

.dash-cursor {
  background: radial-gradient(
    circle at var(--cursor-x) var(--cursor-y),
    color-mix(in oklab, var(--ui-primary) 10%, transparent),
    transparent 26rem
  );
  mix-blend-mode: screen;
  opacity: 0.45;
  will-change: background;
}

.dark .dash-cursor {
  opacity: 0.35;
}

.dash-orb-track {
  will-change: transform;
}

.dash-track-primary {
  transform: translate3d(var(--move-x-soft), var(--move-y-soft), 0);
}

.dash-track-secondary {
  transform: translate3d(var(--move-x-reverse), var(--move-y-soft), 0);
}

.dash-orb {
  opacity: 0.22;
  will-change: transform;
  animation: dash-breathe 30s ease-in-out infinite alternate;
}

.dash-orb-primary {
  background: color-mix(in oklab, var(--ui-primary) 28%, transparent);
  animation-delay: 0s;
}

.dash-orb-secondary {
  background: color-mix(in oklab, var(--ui-secondary) 24%, transparent);
  animation-delay: -12s;
}

.dash-dot-grid {
  background-image: radial-gradient(
    circle,
    color-mix(in oklab, var(--ui-primary) 18%, transparent) 1px,
    transparent 1px
  );
  background-size: 28px 28px;
  opacity: 0.35;
}

.dark .dash-dot-grid {
  opacity: 0.18;
}

.dash-noise {
  background-image:
    radial-gradient(circle at 20% 30%, currentColor 0.5px, transparent 0.5px),
    radial-gradient(circle at 80% 70%, currentColor 0.5px, transparent 0.5px);
  background-size: 20px 20px, 30px 30px;
  color: var(--ui-primary);
}

.dash-vignette {
  background:
    radial-gradient(circle at center, transparent 0%, transparent 50%, var(--ui-bg) 115%),
    linear-gradient(90deg, var(--ui-bg) 0%, transparent 12%, transparent 88%, var(--ui-bg) 100%);
  opacity: 0.55;
}

@keyframes dash-shift {
  0% {
    background-position: 0% 0%, 100% 0%, 50% 55%, 0% 0%;
  }
  50% {
    background-position: 6% 4%, 94% 8%, 53% 60%, 0% 0%;
  }
  100% {
    background-position: 10% 8%, 86% 14%, 47% 65%, 0% 0%;
  }
}

@keyframes dash-breathe {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(0.97);
  }
}

@media (hover: none) {
  .dash-cursor {
    opacity: 0.2;
  }

  .dash-orb-track {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dash-field,
  .dash-orb {
    animation: none;
  }

  .dash-orb-track {
    transform: none;
  }
}
</style>