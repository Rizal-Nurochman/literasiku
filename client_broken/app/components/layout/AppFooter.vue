<script setup lang="ts">
import { FOOTER_LINKS } from '~/constants/footer'

const highlights = [
  {
    label: 'Katalog Online',
    icon: 'i-lucide-search'
  },
  {
    label: 'PDF Reader',
    icon: 'i-lucide-book-open'
  },
  {
    label: 'AI For Learning',
    icon: 'i-lucide-bot'
  }
]
</script>

<template>
  <UFooter class="relative overflow-hidden border-t border-default/70 bg-default/80 backdrop-blur">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,var(--ui-primary)/0.12,transparent_30%),radial-gradient(circle_at_84%_4%,var(--ui-secondary)/0.12,transparent_26%)]"
    />

    <div
      aria-hidden="true"
      class="bg-grid-soft pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-20"
    />

    <template #top>
      <div class="grid gap-8 py-8 lg:grid-cols-[1.15fr_1.6fr] lg:gap-12 lg:py-10">
        <div class="relative overflow-hidden rounded-3xl border border-default/70 bg-default/75 p-5 shadow-xl shadow-primary/5 backdrop-blur sm:p-6">
          <div
            aria-hidden="true"
            class="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/10 blur-3xl"
          />

          <div class="relative">
            <div class="flex items-center gap-3">
              <AppLogo class="h-9 w-auto shrink-0" />

              <div>
                <p class="text-lg font-bold tracking-tight text-highlighted">
                  Literasiku
                </p>

                <p class="text-xs font-medium uppercase tracking-wide text-primary">
                  Digital Library with AI Agent
                </p>
              </div>
            </div>

            <p class="mt-5 max-w-md text-sm leading-6 text-muted">
              Cari koleksi, ajukan peminjaman, baca PDF, dan pahami materi dengan bantuan AI dalam satu pengalaman perpustakaan digital.
            </p>

            <div class="mt-5 flex flex-wrap gap-2">
              <UBadge
                v-for="highlight in highlights"
                :key="highlight.label"
                color="neutral"
                variant="subtle"
                :icon="highlight.icon"
                :label="highlight.label"
                data-cursor="button"
              />
            </div>
          </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-3">
          <div
            v-for="column in FOOTER_LINKS"
            :key="column.label"
            class="rounded-2xl border border-default/60 bg-default/55 p-5 backdrop-blur transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            data-cursor="card"
          >
            <h3 class="text-sm font-semibold text-highlighted">
              {{ column.label }}
            </h3>

            <ul class="mt-4 space-y-3">
              <li
                v-for="item in column.items"
                :key="item.to"
              >
                <ULink
                  :to="item.to"
                  class="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
                >
                  <span class="size-1.5 rounded-full bg-primary/40 transition-all duration-200 group-hover:w-4 group-hover:bg-primary" />
                  <span>{{ item.label }}</span>
                </ULink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <template #left>
      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted lg:justify-start">
        <span>© {{ new Date().getFullYear() }} Literasiku.</span>
        <span class="hidden text-muted/60 sm:inline">•</span>
        <span>Dibuat untuk pengalaman baca yang lebih terarah.</span>
      </div>
    </template>

    <template #right>
      <div class="flex items-center justify-center gap-2 text-sm text-muted lg:justify-end">
        <span>Cari. Pahami. Belajar lebih seru.</span>
      </div>
    </template>
  </UFooter>
</template>
