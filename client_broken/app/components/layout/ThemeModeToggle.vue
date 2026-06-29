<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

interface ThemeParticle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface ViewTransitionResult {
  ready: Promise<void>
  finished: Promise<void>
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionResult
}

const colorMode = useColorMode()
const preferredMotion = usePreferredReducedMotion()

const buttonRef = ref<HTMLElement | null>(null)
const isAnimating = ref(false)
const origin = ref({ x: 0, y: 0 })
const particles = ref<ThemeParticle[]>([])

const isDark = computed(() => colorMode.value === 'dark')
const nextMode = computed(() => isDark.value ? 'light' : 'dark')
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')
const icon = computed(() => isDark.value ? 'i-lucide-sun' : 'i-lucide-moon')
const label = computed(() => isDark.value ? 'Ganti ke mode terang' : 'Ganti ke mode gelap')

const createParticles = () => {
  const baseParticles = [
    { x: -34, y: -16, size: 5, delay: 0, duration: 620 },
    { x: 28, y: -24, size: 4, delay: 30, duration: 700 },
    { x: 46, y: 10, size: 6, delay: 60, duration: 760 },
    { x: -42, y: 18, size: 4, delay: 90, duration: 680 },
    { x: 12, y: 42, size: 5, delay: 120, duration: 720 },
    { x: -10, y: -44, size: 3, delay: 140, duration: 640 },
    { x: 64, y: -8, size: 3, delay: 160, duration: 780 },
    { x: -60, y: -4, size: 5, delay: 180, duration: 740 },
    { x: 22, y: 62, size: 4, delay: 200, duration: 820 },
    { x: -26, y: 58, size: 3, delay: 220, duration: 760 },
    { x: 78, y: 28, size: 5, delay: 240, duration: 840 },
    { x: -76, y: 30, size: 4, delay: 260, duration: 800 }
  ]

  particles.value = baseParticles.map((particle, index) => ({
    id: Date.now() + index,
    ...particle
  }))
}

const getButtonCenter = () => {
  if (!import.meta.client) {
    return { x: 0, y: 0 }
  }

  if (!buttonRef.value) {
    return {
      x: window.innerWidth / 2,
      y: 64
    }
  }

  const rect = buttonRef.value.getBoundingClientRect()

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

const applyTheme = () => {
  colorMode.preference = nextMode.value
}

const toggleMode = async () => {
  if (isAnimating.value) {
    return
  }

  if (!import.meta.client || shouldReduceMotion.value) {
    applyTheme()
    return
  }

  isAnimating.value = true
  origin.value = getButtonCenter()
  createParticles()

  document.documentElement.style.setProperty('--theme-transition-x', `${origin.value.x}px`)
  document.documentElement.style.setProperty('--theme-transition-y', `${origin.value.y}px`)

  const transitionDocument = document as ViewTransitionDocument

  if (transitionDocument.startViewTransition) {
    await transitionDocument.startViewTransition(() => {
      applyTheme()
    }).finished
  } else {
    applyTheme()
    await new Promise(resolve => setTimeout(resolve, 850))
  }

  particles.value = []
  isAnimating.value = false
}
</script>

<template>
  <div
    ref="buttonRef"
    class="inline-flex"
  >
    <UButton
      :icon="icon"
      color="neutral"
      variant="ghost"
      square
      :aria-label="label"
      class="transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:text-primary active:scale-95"
      data-cursor="button"
      @click="toggleMode"
    />

    <Teleport to="body">
      <div
        v-if="isAnimating"
        class="theme-transition-layer"
        :class="isDark ? 'theme-transition-to-light' : 'theme-transition-to-dark'"
        :style="{
          '--x': `${origin.x}px`,
          '--y': `${origin.y}px`
        }"
      >
        <div class="theme-transition-burst" />

        <span
          v-for="particle in particles"
          :key="particle.id"
          class="theme-particle"
          :style="{
            '--particle-x': `${particle.x}px`,
            '--particle-y': `${particle.y}px`,
            '--particle-size': `${particle.size}px`,
            '--particle-delay': `${particle.delay}ms`,
            '--particle-duration': `${particle.duration}ms`
          }"
        />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.theme-transition-layer {
  --x: 50vw;
  --y: 4rem;
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
  isolation: isolate;
}

.theme-transition-burst {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  transform: translate(-50%, -50%) scale(0);
  animation: theme-burst 850ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  filter: blur(0.2px);
}

.theme-transition-to-light .theme-transition-burst {
  background:
    radial-gradient(circle, rgb(255 255 255 / 0.96) 0%, rgb(103 232 249 / 0.7) 24%, rgb(255 255 255 / 0.42) 42%, transparent 68%);
}

.theme-transition-to-dark .theme-transition-burst {
  background:
    radial-gradient(circle, rgb(8 51 68 / 0.96) 0%, rgb(14 116 144 / 0.72) 28%, rgb(3 7 18 / 0.56) 48%, transparent 72%);
}

.theme-particle {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--particle-size);
  height: var(--particle-size);
  border-radius: 9999px;
  transform: translate(-50%, -50%) scale(0);
  animation: particle-burst var(--particle-duration) ease-out var(--particle-delay) forwards;
  box-shadow: 0 0 18px currentColor;
}

.theme-transition-to-light .theme-particle {
  color: rgb(103 232 249);
  background: rgb(255 255 255);
}

.theme-transition-to-dark .theme-particle {
  color: rgb(34 211 238);
  background: rgb(8 145 178);
}

@keyframes theme-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }

  18% {
    opacity: 0.95;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(120);
  }
}

@keyframes particle-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }

  20% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform:
      translate(
        calc(-50% + var(--particle-x)),
        calc(-50% + var(--particle-y))
      )
      scale(1.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-transition-burst,
  .theme-particle {
    animation: none;
  }
}
</style>
