<script setup lang="ts">
import DashboardBackground from '~/components/layout/DashboardBackground.vue'
import ThemeModeToggle from '~/components/layout/ThemeModeToggle.vue'
import { NAV_SIDEBAR_ADMIN, NAV_USER } from '~/constants/navigation'

const { user, logoutMutation } = useAuth()


const initials = computed(() => {
  if (!user.value?.full_name) return ''
  return user.value.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})


const dropdownItems = computed(() => NAV_USER(user, logoutMutation))

watch(
  () => user.value,
  (user) => {
    if (user && user.role !== 'ADMIN') {
      navigateTo('/dashboard')
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar>
      <template #header>
        <div class="flex items-center gap-3 px-4 py-3">
          <AppLogo class="h-8" />
          <div>
            <p class="text-sm font-bold leading-tight">Literasiku</p>
            <p class="text-xs text-muted leading-tight">Admin Panel</p>
          </div>
        </div>
      </template>

      <UNavigationMenu
        orientation="vertical"
        :items="NAV_SIDEBAR_ADMIN"
        class="px-2"
      />

      <template #footer>
        <div class="flex items-center gap-3 px-4 py-3">
          <UAvatar
            :text="initials"
            :alt="user?.full_name"
            size="sm"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium leading-tight truncate">{{ user?.full_name }}</p>
            <p class="text-xs text-muted leading-tight">Administrator</p>
          </div>
          <UButton
            icon="i-lucide-log-out"
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label="Keluar"
            @click="logoutMutation.mutate()"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <div class="flex flex-col flex-1 min-h-screen">
      <UDashboardNavbar>
        <template #left>                  
            <LazyUDashboardSidebarToggle />
        </template>
        <template #right>
          <ThemeModeToggle />
          <UDropdownMenu
            v-if="user"
            :items="dropdownItems"
          >
            <UButton
              variant="ghost"
              color="neutral"
              square
              aria-label="Buka menu akun"
            >
              <UAvatar
                :text="initials"
                :alt="user?.full_name"
                size="sm"
              />
            </UButton>
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <DashboardBackground />

      <main class="flex-1 p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </UDashboardGroup>
</template>