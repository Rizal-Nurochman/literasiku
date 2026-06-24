<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const links = computed<ButtonProps[]>(() => [
  {
    label: 'Buka Katalog Lengkap',
    to: '/dashboard/katalog',
    color: 'primary',
    size: 'lg',
    icon: 'i-lucide-library'
  },
  {
    label: 'Mulai dari Beranda',
    to: '/#beranda',
    color: 'neutral',
    variant: 'subtle',
    size: 'lg',
    icon: 'i-lucide-arrow-up'
  }
])
</script>

<template>
  <section
    id="mulai"
    class="landing-section-compact"
  >
    <UPageCTA
      title="Siap menjelajahi perpustakaan digital yang lebih pintar?"
      description="Mulai dari pencarian koleksi, peminjaman, membaca PDF, sampai bertanya pada AI dengan sitasi — semua dibuat lebih mudah dalam Literasiku."
      :links="links"
      class="relative overflow-hidden rounded-3xl border mb-8 max-w-[80%] mx-auto  shadow-2xl shadow-primary/80 bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent"
    />
  </section>
</template>
