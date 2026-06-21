<script setup lang="ts">
import { useEventListener, useIntersectionObserver, useScroll } from '@vueuse/core'
import ThemeModeToggle from '~/components/layout/ThemeModeToggle.vue'
import { NAV_LINKS } from '~/constants/navigation'

const {
  user,
  isAuthenticated,
  logoutMutation
} = useAuth()

const route = useRoute()
const { y } = useScroll(import.meta.client ? window : undefined)
const activeSection = ref('beranda')
const visibleSections = ref<Record<string, number>>({})
const headerOpen = ref(false)
const sectionsObserved = ref(false)
const preferHashUntil = ref(0)

const observedSectionIds = ['beranda', 'katalog', 'fitur', 'cara-kerja']

const scrolled = computed(() => y.value > 8)
const initials = computed(() => user.value?.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() ?? 'AL')

const getSectionFromPath = (path: string) => {
  if (!path.includes('#')) {
    return ''
  }

  return path.split('#')[1] ?? ''
}

const syncActiveSectionFromHash = () => {
  if (route.path !== '/') {
    return
  }

  const hashSection = route.hash.replace('#', '')

  if (hashSection && observedSectionIds.includes(hashSection)) {
    activeSection.value = hashSection
    preferHashUntil.value = Date.now() + 500
    return
  }

  activeSection.value = 'beranda'
}

const navItems = computed(() => NAV_LINKS.map((item) => {
  const section = getSectionFromPath(item.to)

  return {
    label: item.label,
    to: item.to,
    value: item.to,
    active: section
      ? route.path === '/' && activeSection.value === section
      : route.path === item.to
  }
}))

const dropdownItems = computed(() => [
  [
    {
      label: 'Profil',
      icon: 'i-lucide-user',
      to: '/profil'
    },
    {
      label: 'Riwayat Peminjaman',
      icon: 'i-lucide-history',
      to: '/riwayat'
    }
  ],
  [
    {
      label: 'Keluar',
      icon: 'i-lucide-log-out',
      onSelect: () => logoutMutation.mutate()
    }
  ]
])

const closeMobileMenu = () => {
  headerOpen.value = false
}

const getPathFromEvent = (event?: Event) => {
  const target = event?.target instanceof Element ? event.target : undefined
  const link = target?.closest('a[href]')

  return link?.getAttribute('href') ?? ''
}

const handleNavClick = (event?: Event, to?: string) => {
  const targetPath = to ?? getPathFromEvent(event)

  if (!targetPath) {
    closeMobileMenu()
    return
  }

  const section = getSectionFromPath(targetPath)

  if (section && observedSectionIds.includes(section)) {
    activeSection.value = section
    preferHashUntil.value = Date.now() + 500
  }

  closeMobileMenu()
}

const getMostVisibleSection = () => Object.entries(visibleSections.value)
  .sort(([, ratioA], [, ratioB]) => ratioB - ratioA)
  .find(([, ratio]) => ratio > 0)

const updateActiveSectionFromViewport = () => {
  if (!import.meta.client || route.path !== '/') {
    return
  }

  if (Date.now() < preferHashUntil.value) {
    return
  }

  const viewportAnchor = window.innerHeight * 0.38
  const sectionPositions = observedSectionIds
    .map((sectionId) => {
      const element = document.getElementById(sectionId)

      if (!element) {
        return undefined
      }

      const rect = element.getBoundingClientRect()
      const containsAnchor = rect.top <= viewportAnchor && rect.bottom >= viewportAnchor
      const visible = rect.bottom > 0 && rect.top < window.innerHeight

      return {
        sectionId,
        containsAnchor,
        visible,
        distance: Math.abs(rect.top - viewportAnchor)
      }
    })
    .filter((section): section is {
      sectionId: string
      containsAnchor: boolean
      visible: boolean
      distance: number
    } => Boolean(section))

  const anchoredSection = sectionPositions.find(section => section.containsAnchor)

  if (anchoredSection) {
    activeSection.value = anchoredSection.sectionId
    return
  }

  const nearestSection = sectionPositions
    .filter(section => section.visible)
    .sort((sectionA, sectionB) => sectionA.distance - sectionB.distance)[0]

  if (nearestSection) {
    activeSection.value = nearestSection.sectionId
    return
  }

  const mostVisibleSection = getMostVisibleSection()

  if (mostVisibleSection) {
    activeSection.value = mostVisibleSection[0]
  }
}

const observeSections = () => {
  if (!import.meta.client || route.path !== '/' || sectionsObserved.value) {
    return
  }

  let observedCount = 0

  observedSectionIds.forEach((sectionId) => {
    const element = document.getElementById(sectionId)

    if (!element) {
      return
    }

    useIntersectionObserver(
      element,
      ([entry]) => {
        visibleSections.value = {
          ...visibleSections.value,
          [sectionId]: entry?.isIntersecting ? entry.intersectionRatio : 0
        }

        updateActiveSectionFromViewport()
      },
      {
        threshold: [0.15, 0.25, 0.4, 0.6, 0.8],
        rootMargin: '-18% 0px -55% 0px'
      }
    )

    observedCount += 1
  })

  if (observedCount > 0) {
    sectionsObserved.value = true
  }
}

watch(
  () => route.hash,
  () => syncActiveSectionFromHash(),
  { immediate: true }
)

watch(
  () => route.path,
  async () => {
    if (route.path !== '/') {
      visibleSections.value = {}
    }

    syncActiveSectionFromHash()

    await nextTick()
    observeSections()

    if (!route.hash) {
      updateActiveSectionFromViewport()
    }
  },
  { immediate: true }
)

onMounted(() => {
  syncActiveSectionFromHash()
  observeSections()

  if (!route.hash) {
    updateActiveSectionFromViewport()
  }
})

useEventListener(
  import.meta.client ? window : undefined,
  'scroll',
  updateActiveSectionFromViewport,
  { passive: true }
)

useEventListener(
  import.meta.client ? window : undefined,
  'resize',
  updateActiveSectionFromViewport
)
</script>

<template>
  <UHeader
    v-model:open="headerOpen"
    :class="[
      'sticky top-0 z-50 border-b transition-all duration-300',
      scrolled ? 'border-default/60 bg-default/75 shadow-sm backdrop-blur-xl' : 'border-transparent bg-default/90 backdrop-blur'
    ]"
  >
    <template #title>
      <div class="flex items-center gap-2">
        <AppLogo class="w-auto h-7 shrink-0" />

        <span class="text-lg font-bold tracking-tight">
          Literasiku
        </span>
      </div>
    </template>

    <UNavigationMenu
      :items="navItems"
      class="hidden lg:flex"
      :ui="{ link: 'transition-colors duration-200' }"
      @click="handleNavClick"
    />

    <template #right>
      <ThemeModeToggle />

      <div
        v-if="!isAuthenticated"
        class="hidden sm:flex items-center gap-2"
      >
        <UButton
          label="Masuk"
          to="/auth/login"
          color="neutral"
          variant="ghost"
        />

        <UButton
          label="Daftar"
          to="/auth/register"
          color="primary"
          variant="solid"
        />
      </div>

      <UDropdownMenu
        v-else
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
            :alt="user?.name"
            size="sm"
          />
        </UButton>
      </UDropdownMenu>
    </template>

    <template #body>
      <div class="space-y-5">
        <UNavigationMenu
          :items="navItems"
          orientation="vertical"
          class="w-full"
          :ui="{ link: 'transition-colors duration-200' }"
          @click="handleNavClick"
        />

        <div
          v-if="!isAuthenticated"
          class="grid gap-2"
        >
          <UButton
            label="Masuk"
            to="/auth/login"
            color="neutral"
            variant="ghost"
            block
            @click="closeMobileMenu"
          />

          <UButton
            label="Daftar"
            to="/auth/register"
            color="primary"
            variant="solid"
            block
            @click="closeMobileMenu"
          />
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div class="flex items-center gap-3">
            <UAvatar
              :text="initials"
              :alt="user?.name"
            />

            <div>
              <p class="text-sm font-medium text-highlighted">
                {{ user?.name }}
              </p>

              <p class="text-xs text-muted">
                {{ user?.email }}
              </p>
            </div>
          </div>

          <UButton
            label="Keluar"
            color="neutral"
            variant="soft"
            icon="i-lucide-log-out"
            block
            :loading="logoutMutation.isPending.value"
            @click="logoutMutation.mutate(); closeMobileMenu()"
          />
        </div>
      </div>
    </template>
  </UHeader>
</template>
