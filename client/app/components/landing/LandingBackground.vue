<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

const preferredMotion = usePreferredReducedMotion()
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')

const backgroundRef = ref<HTMLElement | null>(null)

let frameId: number | null = null
let targetX = 0.5
let targetY = 0.32
let currentX = 0.5
let currentY = 0.32

const setBackgroundVariables = (x: number, y: number) => {
  if (!backgroundRef.value) {
    return
  }

  const offsetX = (x - 0.5) * 72
  const offsetY = (y - 0.5) * 56

  backgroundRef.value.style.setProperty('--cursor-x', `${(x * 100).toFixed(2)}%`)
  backgroundRef.value.style.setProperty('--cursor-y', `${(y * 100).toFixed(2)}%`)
  backgroundRef.value.style.setProperty('--move-x', `${offsetX.toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-y', `${offsetY.toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-x-reverse', `${(-offsetX).toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-y-reverse', `${(-offsetY).toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-x-soft', `${(offsetX * 0.38).toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-y-soft', `${(offsetY * 0.38).toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-x-strong', `${(offsetX * 1.18).toFixed(2)}px`)
  backgroundRef.value.style.setProperty('--move-y-strong', `${(offsetY * 1.18).toFixed(2)}px`)
}

const animateBackground = () => {
  currentX += (targetX - currentX) * 0.075
  currentY += (targetY - currentY) * 0.075

  setBackgroundVariables(currentX, currentY)

  frameId = window.requestAnimationFrame(animateBackground)
}

const startBackgroundAnimation = () => {
  if (frameId !== null || shouldReduceMotion.value || !import.meta.client) {
    return
  }

  frameId = window.requestAnimationFrame(animateBackground)
}

const stopBackgroundAnimation = () => {
  if (frameId === null || !import.meta.client) {
    return
  }

  window.cancelAnimationFrame(frameId)
  frameId = null
}

const handlePointerMove = (event: PointerEvent) => {
  if (shouldReduceMotion.value || event.pointerType === 'touch') {
    return
  }

  targetX = event.clientX / window.innerWidth
  targetY = event.clientY / window.innerHeight
}

const resetBackground = () => {
  targetX = 0.5
  targetY = 0.32
}

onMounted(() => {
  if (shouldReduceMotion.value) {
    return
  }

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
    class="aurora-root pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    <div class="aurora-field absolute inset-0" />

    <div class="aurora-cursor absolute inset-0" />

    <div class="water-wave water-wave-one absolute" />

    <div class="water-wave water-wave-two absolute" />

    <div class="bg-grid-soft absolute inset-0 opacity-60 dark:opacity-30" />

    <div class="aurora-noise absolute inset-0 opacity-[0.035] dark:opacity-[0.05]" />

    <div class="aurora-orb-track aurora-track-primary absolute -left-32 top-16 size-[26rem]">
      <div class="aurora-orb aurora-orb-primary size-full rounded-full blur-3xl" />
    </div>

    <div class="aurora-orb-track aurora-track-secondary absolute -right-36 top-44 size-[30rem]">
      <div class="aurora-orb aurora-orb-secondary size-full rounded-full blur-3xl" />
    </div>

    <div class="aurora-orb-track aurora-track-cyan absolute left-1/2 top-[38rem] size-[24rem] -translate-x-1/2">
      <div class="aurora-orb aurora-orb-cyan size-full rounded-full blur-3xl" />
    </div>

    <div class="aurora-orb-track aurora-track-soft absolute bottom-32 left-16 size-[22rem]">
      <div class="aurora-orb aurora-orb-soft size-full rounded-full blur-3xl" />
    </div>

    <div class="aurora-vignette absolute inset-0" />

    <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-default to-transparent" />

    <div class="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-default via-default/80 to-transparent" />
  </div>
</template>

<style scoped>
.aurora-root {
  --cursor-x: 50%;
  --cursor-y: 32%;
  --move-x: 0px;
  --move-y: 0px;
  --move-x-reverse: 0px;
  --move-y-reverse: 0px;
  --move-x-soft: 0px;
  --move-y-soft: 0px;
  --move-x-strong: 0px;
  --move-y-strong: 0px;
}

.aurora-field {
  background:
    radial-gradient(circle at 14% 8%, color-mix(in oklab, var(--ui-primary) 24%, transparent), transparent 28%),
    radial-gradient(circle at 86% 12%, color-mix(in oklab, var(--ui-secondary) 22%, transparent), transparent 26%),
    radial-gradient(circle at 48% 38%, color-mix(in oklab, #22d3ee 14%, transparent), transparent 32%),
    linear-gradient(180deg, var(--ui-bg), transparent 42%, var(--ui-bg));
  background-size: 125% 125%, 125% 125%, 145% 145%, 100% 100%;
  animation: aurora-shift 22s ease-in-out infinite alternate;
  will-change: background-position, filter;
}

.aurora-cursor {
  background:
    radial-gradient(
      circle at var(--cursor-x) var(--cursor-y),
      color-mix(in oklab, var(--ui-secondary) 28%, transparent),
      transparent 17rem
    ),
    radial-gradient(
      circle at var(--cursor-x) var(--cursor-y),
      color-mix(in oklab, var(--ui-primary) 18%, transparent),
      transparent 30rem
    );
  mix-blend-mode: screen;
  opacity: 0.78;
  will-change: background;
}

.dark .aurora-cursor {
  opacity: 0.68;
}

.aurora-orb-track {
  will-change: transform;
}

.aurora-track-primary {
  transform: translate3d(var(--move-x-soft), var(--move-y-soft), 0);
}

.aurora-track-secondary {
  transform: translate3d(var(--move-x-reverse), var(--move-y-soft), 0);
}

.aurora-track-cyan {
  transform: translate3d(var(--move-x-strong), var(--move-y), 0) translateX(-50%);
}

.aurora-track-soft {
  transform: translate3d(var(--move-x), var(--move-y-reverse), 0);
}

.aurora-orb {
  opacity: 0.46;
  will-change: transform, filter;
  animation: aurora-float 18s ease-in-out infinite alternate;
}

.aurora-orb-primary {
  background: color-mix(in oklab, var(--ui-primary) 40%, transparent);
  animation-delay: -2s;
}

.aurora-orb-secondary {
  background: color-mix(in oklab, var(--ui-secondary) 38%, transparent);
  animation-delay: -5s;
}

.aurora-orb-cyan {
  background: color-mix(in oklab, #22d3ee 30%, transparent);
  animation-delay: -8s;
}

.aurora-orb-soft {
  background: color-mix(in oklab, #5eead4 20%, transparent);
  animation-delay: -11s;
}

.aurora-noise {
  background-image:
    radial-gradient(circle at 20% 30%, currentColor 0.6px, transparent 0.6px),
    radial-gradient(circle at 80% 70%, currentColor 0.5px, transparent 0.5px);
  background-size: 24px 24px, 32px 32px;
  color: var(--ui-primary);
}

.aurora-vignette {
  background:
    radial-gradient(circle at center, transparent 0%, transparent 48%, var(--ui-bg) 125%),
    linear-gradient(90deg, var(--ui-bg) 0%, transparent 15%, transparent 85%, var(--ui-bg) 100%);
  opacity: 0.45;
}

.water-wave {
  left: -18%;
  right: -18%;
  top: -38rem;
  height: 42rem;
  opacity: 0;
  border-radius: 0 0 48% 52%;
  mix-blend-mode: screen;
  filter: blur(0.3px);
  will-change: transform, opacity;
  background:
    radial-gradient(ellipse at 50% 100%, rgb(103 232 249 / 0.22), transparent 58%),
    repeating-radial-gradient(
      ellipse at 50% 110%,
      transparent 0 24px,
      rgb(103 232 249 / 0.08) 25px 27px,
      transparent 28px 52px
    ),
    linear-gradient(
      180deg,
      transparent 0%,
      rgb(34 211 238 / 0.08) 34%,
      rgb(6 182 212 / 0.16) 52%,
      rgb(14 165 233 / 0.08) 70%,
      transparent 100%
    );
  mask-image:
    radial-gradient(ellipse at 50% 60%, black 0%, black 52%, transparent 76%);
  -webkit-mask-image:
    radial-gradient(ellipse at 50% 60%, black 0%, black 52%, transparent 76%);
}

.water-wave::before,
.water-wave::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.water-wave::before {
  background:
    repeating-linear-gradient(
      100deg,
      transparent 0 42px,
      rgb(255 255 255 / 0.08) 44px 46px,
      transparent 48px 86px
    );
  transform: translateX(-6%);
  animation: water-ripple-x 5s ease-in-out infinite alternate;
}

.water-wave::after {
  background:
    repeating-radial-gradient(
      ellipse at 50% 100%,
      transparent 0 34px,
      rgb(103 232 249 / 0.12) 35px 37px,
      transparent 38px 74px
    );
  opacity: 0.72;
  transform: scaleX(1.12);
  animation: water-ripple-scale 6s ease-in-out infinite alternate;
}

.water-wave-one {
  animation: water-sweep 18s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}

.water-wave-two {
  top: -34rem;
  height: 38rem;
  opacity: 0;
  filter: blur(0.8px);
  animation: water-sweep-soft 18s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  animation-delay: 8.5s;
}

.dark .water-wave {
  background:
    radial-gradient(ellipse at 50% 100%, rgb(34 211 238 / 0.2), transparent 58%),
    repeating-radial-gradient(
      ellipse at 50% 110%,
      transparent 0 24px,
      rgb(34 211 238 / 0.09) 25px 27px,
      transparent 28px 52px
    ),
    linear-gradient(
      180deg,
      transparent 0%,
      rgb(8 145 178 / 0.1) 34%,
      rgb(34 211 238 / 0.15) 52%,
      rgb(14 116 144 / 0.1) 70%,
      transparent 100%
    );
}

@keyframes aurora-shift {
  0% {
    background-position: 0% 0%, 100% 0%, 50% 40%, 0% 0%;
    filter: hue-rotate(0deg) saturate(1);
  }

  50% {
    background-position: 12% 8%, 88% 14%, 58% 48%, 0% 0%;
    filter: hue-rotate(10deg) saturate(1.12);
  }

  100% {
    background-position: 20% 12%, 78% 22%, 42% 56%, 0% 0%;
    filter: hue-rotate(-8deg) saturate(1.05);
  }
}

@keyframes aurora-float {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    filter: hue-rotate(0deg);
  }

  50% {
    transform: translate3d(2rem, -1.5rem, 0) scale(1.08);
    filter: hue-rotate(12deg);
  }

  100% {
    transform: translate3d(-1.5rem, 1.25rem, 0) scale(0.96);
    filter: hue-rotate(-10deg);
  }
}

@keyframes water-sweep {
  0%,
  57%,
  100% {
    opacity: 0;
    transform: translate3d(0, -20vh, 0) scaleX(1.08) scaleY(0.88);
  }

  8% {
    opacity: 0.38;
  }

  22% {
    opacity: 0.34;
    transform: translate3d(var(--move-x-soft), 46vh, 0) scaleX(1.04) scaleY(1);
  }

  38% {
    opacity: 0.2;
    transform: translate3d(var(--move-x), 104vh, 0) scaleX(1.12) scaleY(1.08);
  }

  50% {
    opacity: 0;
    transform: translate3d(var(--move-x-strong), 136vh, 0) scaleX(1.18) scaleY(1.14);
  }
}

@keyframes water-sweep-soft {
  0%,
  62%,
  100% {
    opacity: 0;
    transform: translate3d(0, -18vh, 0) scaleX(1.16) scaleY(0.9);
  }

  10% {
    opacity: 0.24;
  }

  28% {
    opacity: 0.2;
    transform: translate3d(var(--move-x-reverse), 58vh, 0) scaleX(1.08) scaleY(1.04);
  }

  46% {
    opacity: 0;
    transform: translate3d(var(--move-x-soft), 128vh, 0) scaleX(1.2) scaleY(1.16);
  }
}

@keyframes water-ripple-x {
  from {
    transform: translateX(-7%) skewY(-1deg);
  }

  to {
    transform: translateX(7%) skewY(1deg);
  }
}

@keyframes water-ripple-scale {
  from {
    transform: scaleX(1.08) translateY(-2%);
  }

  to {
    transform: scaleX(1.18) translateY(3%);
  }
}

@media (hover: none) {
  .aurora-cursor {
    opacity: 0.42;
  }

  .aurora-orb-track {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .aurora-field,
  .aurora-orb,
  .water-wave,
  .water-wave::before,
  .water-wave::after {
    animation: none;
  }

  .aurora-orb-track {
    transform: none;
  }

  .water-wave {
    display: none;
  }
}
</style>
