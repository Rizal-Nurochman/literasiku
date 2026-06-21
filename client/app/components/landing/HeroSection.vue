<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { usePreferredReducedMotion } from '@vueuse/core'

type HeroCardStyle = Record<
  | '--rotate-x'
  | '--rotate-y'
  | '--glow-x'
  | '--glow-y'
  | '--card-scale'
  | '--shadow-opacity',
  string
>

const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 450)
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')

const heroCardRef = ref<HTMLElement | null>(null)

const heroCardStyle = reactive<HeroCardStyle>({
  '--rotate-x': '0deg',
  '--rotate-y': '0deg',
  '--glow-x': '50%',
  '--glow-y': '45%',
  '--card-scale': '1',
  '--shadow-opacity': '0.14'
})

const targetState = {
  x: 0.5,
  y: 0.45,
  rotateX: 0,
  rotateY: 0,
  scale: 1,
  shadow: 0.14
}

const currentState = {
  x: 0.5,
  y: 0.45,
  rotateX: 0,
  rotateY: 0,
  scale: 1,
  shadow: 0.14
}

let frameId: number | null = null

const links = computed<ButtonProps[]>(() => [
  {
    label: 'Jelajahi Katalog',
    to: '/#katalog',
    color: 'primary',
    size: 'xl',
    icon: 'i-lucide-search'
  },
  {
    label: 'Cari Buku Sekarang',
    to: '/dashboard/katalog',
    color: 'neutral',
    variant: 'subtle',
    size: 'xl',
    icon: 'i-lucide-library'
  }
])

const readingStats = [
  {
    label: 'Katalog',
    value: 'Online'
  },
  {
    label: 'Akses',
    value: 'Digital'
  },
  {
    label: 'Bantuan',
    value: 'AI'
  }
]

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const syncHeroCardStyle = () => {
  heroCardStyle['--rotate-x'] = `${currentState.rotateX.toFixed(2)}deg`
  heroCardStyle['--rotate-y'] = `${currentState.rotateY.toFixed(2)}deg`
  heroCardStyle['--glow-x'] = `${(currentState.x * 100).toFixed(2)}%`
  heroCardStyle['--glow-y'] = `${(currentState.y * 100).toFixed(2)}%`
  heroCardStyle['--card-scale'] = currentState.scale.toFixed(4)
  heroCardStyle['--shadow-opacity'] = currentState.shadow.toFixed(2)
}

const animateHeroCard = () => {
  currentState.x += (targetState.x - currentState.x) * 0.14
  currentState.y += (targetState.y - currentState.y) * 0.14
  currentState.rotateX += (targetState.rotateX - currentState.rotateX) * 0.14
  currentState.rotateY += (targetState.rotateY - currentState.rotateY) * 0.14
  currentState.scale += (targetState.scale - currentState.scale) * 0.14
  currentState.shadow += (targetState.shadow - currentState.shadow) * 0.14

  syncHeroCardStyle()

  const isSettled = Math.abs(targetState.x - currentState.x) < 0.001
    && Math.abs(targetState.y - currentState.y) < 0.001
    && Math.abs(targetState.rotateX - currentState.rotateX) < 0.01
    && Math.abs(targetState.rotateY - currentState.rotateY) < 0.01
    && Math.abs(targetState.scale - currentState.scale) < 0.001
    && Math.abs(targetState.shadow - currentState.shadow) < 0.001

  if (isSettled) {
    frameId = null
    return
  }

  frameId = window.requestAnimationFrame(animateHeroCard)
}

const requestHeroCardAnimation = () => {
  if (!import.meta.client || frameId !== null) {
    return
  }

  frameId = window.requestAnimationFrame(animateHeroCard)
}

const handleHeroCardMove = (event: PointerEvent) => {
  if (shouldReduceMotion.value || !heroCardRef.value || event.pointerType === 'touch') {
    return
  }

  const rect = heroCardRef.value.getBoundingClientRect()
  const x = clamp((event.clientX - rect.left) / rect.width, 0, 1)
  const y = clamp((event.clientY - rect.top) / rect.height, 0, 1)

  targetState.x = x
  targetState.y = y
  targetState.rotateX = clamp((0.5 - y) * 7.5, -6, 6)
  targetState.rotateY = clamp((x - 0.5) * 9.5, -7, 7)
  targetState.scale = 1.012
  targetState.shadow = 0.2

  requestHeroCardAnimation()
}

const resetHeroCard = () => {
  targetState.x = 0.5
  targetState.y = 0.45
  targetState.rotateX = 0
  targetState.rotateY = 0
  targetState.scale = 1
  targetState.shadow = 0.14

  requestHeroCardAnimation()
}

onBeforeUnmount(() => {
  if (frameId !== null && import.meta.client) {
    window.cancelAnimationFrame(frameId)
  }
})
</script>

<template>
  <section
    id="beranda"
    class="landing-section-hero"
  >
    <UPageHero
      orientation="horizontal"
      headline="AI-Powered Digital Library"
      description="Literasiku menggabungkan katalog online, peminjaman buku, PDF reader, dan AI assistant bersitasi agar pengalaman membaca lebih cepat, terarah, dan menyenangkan."
      :links="links"
      class="py-0 pt-4 sm:pt-6 lg:pt-8"
      :ui="{ title: 'max-w-4xl', description: 'max-w-3xl' }"
    >
      <template #title>
        Temukan, Baca, dan
        <span class="gradient-text">Pahami Buku</span>
        dengan Bantuan AI
      </template>

      <div
        v-motion
        :initial="{ opacity: 0, x: 36, scale: 0.98 }"
        :enter="{ opacity: 1, x: 0, scale: 1, transition: { duration, delay: shouldReduceMotion ? 0 : 140, ease: 'easeOut' } }"
        class="relative w-full px-2 sm:px-6 lg:px-0 [perspective:1500px]"
      >
        <div
          aria-hidden="true"
          class="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/25 via-secondary/15 to-cyan-400/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          class="absolute -right-8 top-10 -z-10 size-36 rounded-full bg-primary/20 blur-2xl"
        />

        <div
          aria-hidden="true"
          class="absolute -bottom-10 left-8 -z-10 size-40 rounded-full bg-secondary/20 blur-2xl"
        />

        <div
          ref="heroCardRef"
          class="hero-card-frame"
          data-cursor="card"
          :style="heroCardStyle"
          @pointermove="handleHeroCardMove"
          @pointerleave="resetHeroCard"
          @pointercancel="resetHeroCard"
          @blur="resetHeroCard"
        >
          <UCard class="hero-glass-card group/card relative isolate overflow-hidden border border-default/70 !bg-transparent shadow-none">
            <div
              aria-hidden="true"
              class="hero-glass-surface pointer-events-none absolute inset-0"
            />

            <div
              aria-hidden="true"
              class="hero-card-cursor-glow pointer-events-none absolute inset-0"
            />

            <div
              aria-hidden="true"
              class="hero-card-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
            />

            <div
              aria-hidden="true"
              class="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/15 blur-3xl"
            />

            <div
              aria-hidden="true"
              class="pointer-events-none absolute -bottom-24 -left-20 size-56 rounded-full bg-secondary/15 blur-3xl"
            />

            <div class="hero-card-content relative z-10 space-y-5">
              <div class="flex items-center justify-between gap-4 border-b border-default/60 pb-4">
                <div class="flex items-center gap-3">
                  <div class="hero-icon-depth flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-gradient-to-br from-primary/20 to-secondary/20 text-primary shadow-lg shadow-primary/10">
                    <UIcon
                      name="i-lucide-layout-dashboard"
                      class="size-5"
                    />
                  </div>

                  <div>
                    <p class="text-sm text-muted">
                      Live Catalog
                    </p>

                    <h2 class="mt-1 text-xl font-semibold text-highlighted">
                      Dasbor Anggota
                    </h2>
                  </div>
                </div>

                <div class="hero-status-pill flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                  <span class="size-2 rounded-full bg-success shadow-sm shadow-success/40" />
                  Aktif
                </div>
              </div>

              <div class="hero-panel hero-mini-depth rounded-xl p-3">
                <div class="flex items-center gap-3 rounded-lg border border-default/60 bg-default/50 px-3 py-3 text-sm text-muted shadow-sm backdrop-blur-xl">
                  <UIcon
                    name="i-lucide-search"
                    class="size-4 text-primary"
                  />

                  <span class="flex-1">
                    Cari buku, penulis, atau topik belajar
                  </span>

                  <UIcon
                    name="i-lucide-command"
                    class="hidden size-4 text-muted sm:block"
                  />
                </div>
              </div>

              <div class="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div class="hero-panel hero-mini-depth rounded-xl p-4">
                  <div class="mb-4 flex items-start gap-3">
                    <div class="hero-icon-depth flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-lg shadow-primary/10">
                      <UIcon
                        name="i-lucide-book-marked"
                        class="size-6"
                      />
                    </div>

                    <div class="min-w-0 flex-1">
                      <p class="truncate font-semibold text-highlighted">
                        Dasar Pemrograman Modern
                      </p>

                      <p class="text-sm text-muted">
                        Teknologi · Koleksi pembelajaran
                      </p>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div class="hero-skeleton-line h-3 w-full rounded-full" />
                    <div class="hero-skeleton-line h-3 w-10/12 rounded-full" />
                    <div class="hero-skeleton-line h-3 w-11/12 rounded-full" />
                  </div>

                  <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div class="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-success">
                      Fisik tersedia
                    </div>

                    <div class="rounded-lg border border-info/20 bg-info/10 px-3 py-2 text-info">
                      Digital tersedia
                    </div>
                  </div>
                </div>

                <div class="hero-panel hero-mini-depth rounded-xl p-4">
                  <div class="mb-4 flex items-center gap-2">
                    <div class="hero-icon-depth flex size-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                      <UIcon
                        name="i-lucide-activity"
                        class="size-4"
                      />
                    </div>

                    <p class="text-sm font-medium text-highlighted">
                      Progress Membaca
                    </p>
                  </div>

                  <div class="space-y-3">
                    <div>
                      <div class="mb-2 flex items-center justify-between text-xs text-muted">
                        <span>Bab 2</span>
                        <span>72%</span>
                      </div>

                      <div class="h-2 overflow-hidden rounded-full bg-muted">
                        <div class="hero-progress h-2 w-[72%] rounded-full" />
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                      <div
                        v-for="stat in readingStats"
                        :key="stat.label"
                        class="rounded-lg border border-default/60 bg-muted/25 p-2 text-center backdrop-blur-sm"
                      >
                        <p class="text-[11px] text-muted">
                          {{ stat.label }}
                        </p>

                        <p class="mt-1 text-xs font-semibold text-highlighted">
                          {{ stat.value }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row">
                <UButton
                  label="Pinjam Digital"
                  icon="i-lucide-book-open"
                  color="primary"
                  data-cursor="primary"
                />

                <UButton
                  label="Tanya AI"
                  icon="i-lucide-bot"
                  color="neutral"
                  variant="soft"
                  data-cursor="button"
                />
              </div>

              <div class="hero-panel hero-mini-depth relative overflow-hidden rounded-xl p-4">
                <div
                  aria-hidden="true"
                  class="absolute -right-10 -top-10 size-28 rounded-full bg-secondary/20 blur-2xl"
                />

                <div class="relative flex gap-3">
                  <UAvatar
                    icon="i-lucide-bot"
                    size="sm"
                  />

                  <div class="space-y-2">
                    <p class="text-sm font-medium text-highlighted">
                      Insight AI Pembaca
                    </p>

                    <p class="text-sm leading-6 text-muted">
                      Bab ini menjelaskan alur algoritma melalui contoh bertahap dan bisa ditelusuri kembali ke sumber bacaan.
                    </p>

                    <div class="flex items-center gap-2 text-xs text-primary">
                      <UIcon
                        name="i-lucide-quote"
                        class="size-3.5"
                      />

                      <span>Sumber bacaan terhubung</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : 280, ease: 'easeOut' } }"
          class="mx-auto mt-5 max-w-md rounded-2xl border border-default/70 bg-default/60 p-3 shadow-xl shadow-primary/5 backdrop-blur-xl"
        >
          <div class="flex items-center justify-center gap-3 text-sm text-muted">
            <UIcon
              name="i-lucide-sparkles"
              class="size-4 text-primary"
            />

            <span>
              Cari koleksi, baca PDF, dan pahami materi dalam satu alur.
            </span>
          </div>
        </div>
      </div>
    </UPageHero>
  </section>
</template>

<style scoped>
.hero-card-frame {
  transform-style: preserve-3d;
  transform:
    rotateX(var(--rotate-x))
    rotateY(var(--rotate-y))
    scale(var(--card-scale));
  will-change: transform;
}

.hero-glass-card {
  transform-style: preserve-3d;
  box-shadow:
    0 32px 90px rgb(0 166 214 / var(--shadow-opacity)),
    0 18px 45px rgb(6 182 212 / 0.08);
}

.hero-glass-surface {
  background:
    radial-gradient(
      circle at var(--glow-x) var(--glow-y),
      rgb(103 232 249 / 0.16),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      color-mix(in oklab, var(--ui-bg) 74%, transparent),
      color-mix(in oklab, var(--ui-bg) 50%, transparent)
    );
  backdrop-filter: blur(28px) saturate(1.45);
  -webkit-backdrop-filter: blur(28px) saturate(1.45);
}

.hero-glass-surface::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(
      135deg,
      rgb(255 255 255 / 0.12),
      transparent 28%,
      transparent 62%,
      rgb(255 255 255 / 0.04)
    );
}

.hero-glass-surface::after {
  content: "";
  position: absolute;
  inset: 1px;
  pointer-events: none;
  border-radius: inherit;
  border: 1px solid rgb(255 255 255 / 0.06);
}

.hero-card-content {
  transform: translateZ(36px);
  transform-style: preserve-3d;
}

.hero-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(125 211 252 / 0.14);
  background:
    radial-gradient(
      circle at var(--glow-x) var(--glow-y),
      rgb(34 211 238 / 0.1),
      transparent 48%
    ),
    linear-gradient(
      135deg,
      color-mix(in oklab, var(--ui-bg) 64%, transparent),
      color-mix(in oklab, var(--ui-bg) 42%, transparent)
    );
  backdrop-filter: blur(18px) saturate(1.25);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.06),
    0 12px 34px rgb(0 166 214 / 0.04);
}

.hero-mini-depth {
  transform: translateZ(22px);
  transition:
    border-color 260ms ease,
    box-shadow 260ms ease,
    background 260ms ease;
}

.hero-icon-depth {
  transform: translateZ(38px);
}

.hero-card-frame:hover .hero-mini-depth {
  border-color: rgb(6 182 212 / 0.34);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 16px 42px rgb(0 166 214 / 0.08);
}

.hero-card-cursor-glow {
  background:
    radial-gradient(
      circle at var(--glow-x) var(--glow-y),
      rgb(103 232 249 / 0.22),
      transparent 38%
    );
  opacity: 0.78;
  mix-blend-mode: screen;
}

.hero-card-shine {
  background:
    linear-gradient(
      120deg,
      transparent 18%,
      rgb(255 255 255 / 0.1) 42%,
      transparent 64%
    );
  transform: translateX(-52%);
}

.hero-card-frame:hover .hero-card-shine {
  animation: card-shine 950ms ease forwards;
}

.hero-skeleton-line {
  background: linear-gradient(
    90deg,
    rgb(6 182 212 / 0.16),
    rgb(103 232 249 / 0.28),
    rgb(6 182 212 / 0.16)
  );
  background-size: 220% 100%;
  animation: skeleton-flow 4s ease-in-out infinite;
}

.hero-progress {
  background: linear-gradient(90deg, var(--ui-primary), var(--ui-secondary), #22d3ee);
  background-size: 180% 100%;
  box-shadow: 0 0 18px rgb(34 211 238 / 0.28);
  animation: progress-flow 3.5s ease-in-out infinite;
}

.hero-status-pill {
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05);
}

@keyframes card-shine {
  from {
    transform: translateX(-60%);
  }

  to {
    transform: translateX(60%);
  }
}

@keyframes skeleton-flow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes progress-flow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@media (pointer: coarse) {
  .hero-card-frame {
    transform: none;
  }

  .hero-card-content,
  .hero-mini-depth,
  .hero-icon-depth {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-card-frame,
  .hero-glass-card,
  .hero-card-content,
  .hero-mini-depth,
  .hero-icon-depth,
  .hero-card-cursor-glow,
  .hero-card-shine,
  .hero-skeleton-line,
  .hero-progress {
    transform: none;
    animation: none;
    transition: none;
  }
}
</style>
