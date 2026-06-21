<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { ROLES } from '~/constants/roles'

const preferredMotion = usePreferredReducedMotion()
const duration = computed(() => preferredMotion.value === 'reduce' ? 0 : 400)
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')

const roleIcon = (role: string) => role === 'Untuk Admin' ? 'i-lucide-shield-check' : 'i-lucide-user-round'
</script>

<template>
  <section
    id="peran"
    v-motion
    class="landing-section"
    :initial="{ opacity: 0, y: 18 }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, ease: 'easeOut' } }"
  >
    <UPageSection
      title="Satu sistem untuk anggota dan admin"
      description="Anggota mendapat pengalaman baca yang cepat, sementara admin tetap memegang kendali data koleksi dan peminjaman."
      class="w-full py-0"
    >
      <div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <UPageCard
          v-for="(role, index) in ROLES"
          :key="role.role"
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration, delay: shouldReduceMotion ? 0 : index * 80, ease: 'easeOut' } }"
          variant="subtle"
          class="group flex-1 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
          data-cursor="card"
        >
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-105">
                  <UIcon
                    :name="roleIcon(role.role)"
                    class="size-6"
                  />
                </div>

                <div>
                  <UBadge
                    color="primary"
                    variant="subtle"
                    :label="role.role.replace('Untuk ', '')"
                  />

                  <h3 class="mt-2 text-xl font-semibold text-highlighted">
                    {{ role.role }}
                  </h3>
                </div>
              </div>
            </div>
          </template>

          <div class="flex h-full flex-col justify-between">
            <ul class="space-y-3">
              <li
                v-for="feature in role.features"
                :key="feature"
                class="flex items-start gap-3 text-sm text-muted"
              >
                <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UIcon
                    name="i-lucide-check"
                    class="size-3.5"
                  />
                </span>

                <span>{{ feature }}</span>
              </li>
            </ul>

            <div class="mt-5 rounded-xl border border-default/60 bg-muted/30 p-3 sm:p-4">
              <p class="text-sm text-muted">
                {{ role.role === 'Untuk Admin'
                  ? 'Kelola koleksi, anggota, dan laporan perpustakaan dalam satu dashboard.'
                  : 'Cari buku, baca koleksi digital, dan pahami materi dengan bantuan AI.'
                }}
              </p>
            </div>
          </div>
        </UPageCard>
      </div>
    </UPageSection>
  </section>
</template>
