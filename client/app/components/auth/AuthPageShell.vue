<template>
  <div class="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,var(--ui-primary)/0.16,transparent_30%),radial-gradient(circle_at_85%_20%,var(--ui-secondary)/0.14,transparent_26%),linear-gradient(135deg,var(--ui-bg),var(--ui-bg-muted))]"
    />

    <div
      aria-hidden="true"
      class="animated-orb pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10"
    />

    <div
      aria-hidden="true"
      class="animated-orb pointer-events-none absolute -right-20 bottom-10 -z-10 h-80 w-80 rounded-full bg-secondary/20 blur-3xl dark:bg-secondary/10"
    />

    <div class="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <div class="space-y-8">
        <div class="inline-flex items-center gap-3">
          <AppLogo class="h-10 w-auto shrink-0" />

          <div>
            <NuxtLink
              to="/"
              class="text-xl font-bold tracking-tight text-highlighted"
            >
              Literasiku
            </NuxtLink>

            <p class="text-sm text-muted">
              Digital Library with AI Agent
            </p>
          </div>
        </div>

        <div class="max-w-xl space-y-5">
          <UBadge
            color="secondary"
            variant="subtle"
            icon="i-lucide-sparkles"
            label="Digital Library with AI Agent"
          />

          <h1 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl lg:text-5xl">
            Akses perpustakaan digital dengan alur yang lebih pintar.
          </h1>

          <p class="text-base leading-7 text-muted">
            Masuk untuk mencari katalog, membaca PDF, mengajukan peminjaman, dan memakai bantuan AI bersitasi dalam satu pengalaman yang rapi.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div
            v-for="benefit in benefits"
            :key="benefit.label"
            class="rounded-lg border border-default bg-default/70 p-4 shadow-sm backdrop-blur"
          >
            <UIcon
              :name="benefit.icon"
              class="mb-3 size-5 text-primary"
            />

            <p class="text-sm font-medium text-highlighted">
              {{ benefit.label }}
            </p>
          </div>
        </div>
      </div>

      <div class="mx-auto w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const benefits = [
  {
    label: 'Katalog digital',
    icon: 'i-lucide-search'
  },
  {
    label: 'PDF reader',
    icon: 'i-lucide-book-open'
  },
  {
    label: 'AI citation helper',
    icon: 'i-lucide-bot'
  }
]
</script>
