<script setup lang="ts">
import DashboardUserProfileHeader from '~/components/dashboard/user/profil/ProfileHeader.vue'
import DashboardUserProfileForm from '~/components/dashboard/user/profil/ProfileForm.vue'
import type { UpdateUserInput } from '#shared/schemas/users.schema'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Profil Pengguna - Literasiku',
  description: 'Kelola data diri dan informasi akun Literasiku Anda.'
})

const { useMeQuery, updateMeMutation } = useUsers()
const { data: user, isLoading } = useMeQuery()

const onSubmit = (data: UpdateUserInput) => {
  updateMeMutation.mutate(data)
}
</script>

<template>
  <div class="relative isolate overflow-hidden min-h-[calc(100vh-4rem)]">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,var(--ui-primary)/0.14,transparent_30%),radial-gradient(circle_at_82%_10%,var(--ui-secondary)/0.12,transparent_28%),linear-gradient(180deg,var(--ui-bg),var(--ui-bg-muted))]"
    />
    <div
      aria-hidden="true"
      class="bg-grid-soft pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-30"
    />

    <UPageSection
      v-motion
      :initial="{ opacity: 0, y: 28 }"
      :visible-once="{ opacity: 1, y: 0, transition: { duration: 450, ease: 'easeOut' } }"
      title="Profil Saya"
      description="Perbarui informasi pribadi dan kelola data akun Anda."
      :ui="{ root: 'pt-8', header: 'mb-8' }"
    >
      <div class="max-w-4xl mx-auto mt-4">
        <div v-if="isLoading" class="flex items-center justify-center py-20">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
        </div>
        
        <template v-else>
          <DashboardUserProfileHeader :user="user" />
          
          <UCard class="bg-default/80 backdrop-blur border-default shadow-sm relative overflow-hidden">
            <div
              v-if="updateMeMutation.isPending.value"
              class="absolute inset-0 z-10 bg-default/50 backdrop-blur-sm flex items-center justify-center"
            >
              <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
            </div>
            
            <template #header>
              <div>
                <h3 class="text-lg font-semibold text-default">Informasi Pribadi</h3>
                <p class="text-sm text-muted mt-1">Pastikan data di bawah ini valid agar kami mudah menghubungi Anda.</p>
              </div>
            </template>
            
            <DashboardUserProfileForm :user="user" @submit="onSubmit" />
          </UCard>
        </template>
      </div>
    </UPageSection>
  </div>
</template>
