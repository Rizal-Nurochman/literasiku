<script setup lang="ts">
import type { UserResponse } from '#shared/types/users'

defineProps<{
  user?: UserResponse
}>()

const getInitials = (name?: string) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
</script>

<template>
  <div class="bg-default/80 backdrop-blur rounded-xl border border-default shadow-sm p-6 mb-6">
    <div class="flex flex-col sm:flex-row items-center gap-6">
      <UAvatar
        :alt="user?.full_name"
        :text="getInitials(user?.full_name)"
        size="3xl"
        class="ring-4 ring-primary/20 shrink-0"
        :ui="{ fallback: 'text-2xl' }"
      />
      
      <div class="flex-1 text-center sm:text-left space-y-1">
        <h2 class="text-2xl font-bold text-default">{{ user?.full_name || 'Memuat...' }}</h2>
        <p class="text-muted text-sm font-medium">@{{ user?.username || '-' }} &bull; {{ user?.role || '-' }}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
        <div class="bg-muted/10 rounded-lg p-3 text-center sm:text-left">
          <p class="text-xs text-muted font-medium mb-1 uppercase tracking-wide">No. Anggota</p>
          <p class="text-sm font-semibold">{{ user?.membership_number || '-' }}</p>
        </div>
        <div class="bg-muted/10 rounded-lg p-3 text-center sm:text-left">
          <p class="text-xs text-muted font-medium mb-1 uppercase tracking-wide">No. Identitas</p>
          <p class="text-sm font-semibold">{{ user?.identity_number || '-' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
