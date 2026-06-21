<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

const cursorVariants = [
  'default',
  'button',
  'primary',
  'link',
  'search',
  'input',
  'close',
  'card',
  'drag',
  'disabled',
  'loading'
] as const

type CursorVariant = typeof cursorVariants[number]

interface CursorBurst {
  id: number
  x: number
  y: number
  variant: CursorVariant
}

type CursorStyle = Record<'--cursor-x' | '--cursor-y', string>

const preferredMotion = usePreferredReducedMotion()
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')

const mounted = ref(false)
const enabled = ref(false)
const variant = ref<CursorVariant>('default')
const isPointerDown = ref(false)
const bursts = ref<CursorBurst[]>([])

const cursorStyle = reactive<CursorStyle>({
  '--cursor-x': '0px',
  '--cursor-y': '0px'
})

let frameId: number | null = null
let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0

const variantIcon = computed(() => {
  const icons: Record<CursorVariant, string> = {
    default: 'i-lucide-sparkle',
    button: 'i-lucide-mouse-pointer-click',
    primary: 'i-lucide-zap',
    link: 'i-lucide-arrow-up-right',
    search: 'i-lucide-search',
    input: 'i-lucide-text-cursor-input',
    close: 'i-lucide-x',
    card: 'i-lucide-compass',
    drag: 'i-lucide-move',
    disabled: 'i-lucide-ban',
    loading: 'i-lucide-loader-circle'
  }

  return icons[variant.value]
})

const isCursorVariant = (value: string | undefined): value is CursorVariant => Boolean(
  value
  && cursorVariants.includes(value as CursorVariant)
)

const hasPrimaryVisual = (element: HTMLElement) => Array.from(element.classList)
  .some(className => className === 'bg-primary'
    || className.startsWith('bg-primary/'))

const detectVariant = (target: EventTarget | null): CursorVariant => {
  if (!(target instanceof Element)) {
    return 'default'
  }

  const element = target.closest<HTMLElement>(
    '[data-cursor], button, a, input, textarea, select, [contenteditable="true"], [role="button"], [aria-label], [aria-busy="true"]'
  )

  if (!element) {
    return 'default'
  }

  if (
    element.hasAttribute('disabled')
    || element.getAttribute('aria-disabled') === 'true'
  ) {
    return 'disabled'
  }

  if (
    element.getAttribute('aria-busy') === 'true'
    || element.classList.contains('cursor-loading')
  ) {
    return 'loading'
  }

  if (isCursorVariant(element.dataset.cursor)) {
    return element.dataset.cursor
  }

  const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() ?? ''

  if (ariaLabel.includes('close') || ariaLabel.includes('tutup')) {
    return 'close'
  }

  if (ariaLabel.includes('search') || ariaLabel.includes('cari')) {
    return 'search'
  }

  if (element.matches('input, textarea, select, [contenteditable="true"]')) {
    return 'input'
  }

  if (element.matches('a')) {
    return hasPrimaryVisual(element) ? 'primary' : 'link'
  }

  if (element.matches('button, [role="button"]')) {
    return hasPrimaryVisual(element) ? 'primary' : 'button'
  }

  return 'default'
}

const updateCursor = () => {
  currentX += (targetX - currentX) * 0.18
  currentY += (targetY - currentY) * 0.18

  cursorStyle['--cursor-x'] = `${currentX.toFixed(2)}px`
  cursorStyle['--cursor-y'] = `${currentY.toFixed(2)}px`

  frameId = window.requestAnimationFrame(updateCursor)
}

const handlePointerMove = (event: PointerEvent) => {
  targetX = event.clientX
  targetY = event.clientY
  variant.value = detectVariant(event.target)
}

const handlePointerDown = (event: PointerEvent) => {
  isPointerDown.value = true

  const currentVariant = detectVariant(event.target)

  if (currentVariant === 'disabled') {
    return
  }

  bursts.value.push({
    id: Date.now(),
    x: event.clientX,
    y: event.clientY,
    variant: currentVariant
  })

  window.setTimeout(() => {
    bursts.value.shift()
  }, 500)
}

const handlePointerUp = () => {
  isPointerDown.value = false
}

onMounted(() => {
  mounted.value = true

  if (shouldReduceMotion.value) {
    return
  }

  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  if (!supportsFinePointer) {
    return
  }

  enabled.value = true
  document.documentElement.classList.add('has-custom-cursor')

  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerdown', handlePointerDown, { passive: true })
  window.addEventListener('pointerup', handlePointerUp, { passive: true })
  window.addEventListener('pointerleave', handlePointerUp)

  frameId = window.requestAnimationFrame(updateCursor)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('has-custom-cursor')

  if (frameId !== null) {
    window.cancelAnimationFrame(frameId)
  }

  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointerleave', handlePointerUp)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="mounted && enabled"
      class="app-cursor"
      :class="[
        `app-cursor-${variant}`,
        isPointerDown && 'is-down'
      ]"
      :style="cursorStyle"
    >
      <div class="app-cursor-ring" />

      <div class="app-cursor-core">
        <UIcon
          :name="variantIcon"
          class="app-cursor-icon"
          :class="{ 'animate-spin': variant === 'loading' }"
        />
      </div>
    </div>

    <span
      v-for="burst in bursts"
      :key="burst.id"
      class="cursor-burst"
      :class="[
        `cursor-burst-${burst.variant}`,
        ['primary', 'button', 'card'].includes(burst.variant) && 'cursor-burst-impact'
      ]"
      :style="{
        left: `${burst.x}px`,
        top: `${burst.y}px`
      }"
    />
  </Teleport>
</template>

<style scoped>
.app-cursor {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10000;
  pointer-events: none;
  transform: translate3d(var(--cursor-x), var(--cursor-y), 0);
  mix-blend-mode: normal;
  isolation: isolate;
}

.app-cursor-ring {
  position: absolute;
  left: 0;
  top: 0;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 9999px;
  border: 1px solid rgb(34 211 238 / 0.4);
  background: rgb(34 211 238 / 0.06);
  box-shadow:
    0 0 24px rgb(34 211 238 / 0.18),
    inset 0 0 18px rgb(34 211 238 / 0.08);
  transform: translate(-50%, -50%) scale(1);
  transition:
    width 180ms ease,
    height 180ms ease,
    border-color 180ms ease,
    background 180ms ease,
    transform 120ms ease,
    box-shadow 180ms ease;
}

.app-cursor-core {
  position: absolute;
  left: 0;
  top: 0;
  width: 1.35rem;
  height: 1.35rem;
  display: grid;
  place-items: center;
  border-radius: 9999px;
  color: rgb(8 145 178);
  background: rgb(236 254 255 / 0.92);
  box-shadow:
    0 8px 24px rgb(8 145 178 / 0.18),
    inset 0 1px 0 rgb(255 255 255 / 0.65);
  transform: translate(-50%, -50%) scale(1);
  transition:
    transform 140ms ease,
    background 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease;
  backdrop-filter: blur(12px);
}

.app-cursor-icon {
  width: 0.78rem;
  height: 0.78rem;
}

.app-cursor.is-down .app-cursor-ring {
  transform: translate(-50%, -50%) scale(0.78);
}

.app-cursor.is-down .app-cursor-core {
  transform: translate(-50%, -50%) scale(0.9);
}

.app-cursor-button .app-cursor-ring,
.app-cursor-primary .app-cursor-ring {
  width: 3.1rem;
  height: 3.1rem;
  border-color: rgb(6 182 212 / 0.65);
  background: rgb(6 182 212 / 0.1);
  box-shadow:
    0 0 32px rgb(6 182 212 / 0.26),
    inset 0 0 24px rgb(6 182 212 / 0.1);
}

.app-cursor-primary .app-cursor-core {
  color: white;
  background: linear-gradient(135deg, var(--ui-primary), var(--ui-secondary));
}

.app-cursor-link .app-cursor-ring {
  width: 2.8rem;
  height: 2.8rem;
  border-color: rgb(14 165 233 / 0.55);
  transform: translate(-50%, -50%) scale(1) rotate(-12deg);
}

.app-cursor-search .app-cursor-ring {
  width: 3rem;
  height: 3rem;
  border-style: dashed;
  animation: cursor-scan 1.8s linear infinite;
}

.app-cursor-input .app-cursor-ring {
  width: 1.25rem;
  height: 2.6rem;
  border-radius: 999px;
  border-color: rgb(6 182 212 / 0.45);
  background: rgb(6 182 212 / 0.04);
}

.app-cursor-close .app-cursor-ring {
  width: 2.9rem;
  height: 2.9rem;
  border-color: rgb(248 113 113 / 0.62);
  background: rgb(248 113 113 / 0.1);
  box-shadow:
    0 0 28px rgb(248 113 113 / 0.2),
    inset 0 0 20px rgb(248 113 113 / 0.08);
}

.app-cursor-close .app-cursor-core {
  color: rgb(239 68 68);
  background: rgb(254 242 242 / 0.92);
}

.app-cursor-card .app-cursor-ring {
  width: 3.4rem;
  height: 3.4rem;
  border-color: rgb(45 212 191 / 0.55);
  background:
    radial-gradient(circle, rgb(45 212 191 / 0.12), transparent 68%);
}

.app-cursor-drag .app-cursor-ring {
  width: 3.6rem;
  height: 2.4rem;
  border-radius: 999px;
}

.app-cursor-disabled .app-cursor-ring {
  border-color: rgb(161 161 170 / 0.45);
  background: rgb(161 161 170 / 0.08);
}

.app-cursor-disabled .app-cursor-core {
  color: rgb(113 113 122);
  background: rgb(244 244 245 / 0.9);
}

.cursor-burst {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  background: rgb(34 211 238);
  box-shadow: 0 0 26px rgb(34 211 238 / 0.5);
  transform: translate(-50%, -50%) scale(0);
  animation: cursor-burst 460ms ease-out forwards;
}

.cursor-burst-impact::before,
.cursor-burst-impact::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 2.6rem;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgb(103 232 249), transparent);
  transform-origin: center;
}

.cursor-burst-impact::before {
  transform: translate(-50%, -50%) rotate(42deg);
}

.cursor-burst-impact::after {
  transform: translate(-50%, -50%) rotate(-42deg);
}

.cursor-burst-close {
  background: rgb(248 113 113);
  box-shadow: 0 0 26px rgb(248 113 113 / 0.45);
}

@keyframes cursor-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }

  35% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2.8);
  }
}

@keyframes cursor-scan {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-cursor,
  .app-cursor-ring,
  .app-cursor-core,
  .cursor-burst {
    animation: none;
    transition: none;
  }
}
</style>
