<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'

definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const bookId = computed(() => Number(route.params.book_id))

const { useDigitalAccess } = useLoans()
const { useBookFiles } = useFiles()

const { data: accessData, isLoading: isAccessLoading } = useDigitalAccess(bookId)
const { data: filesData, isLoading: isFilesLoading } = useBookFiles(bookId)

const preferredMotion = usePreferredReducedMotion()
const shouldReduceMotion = computed(() => preferredMotion.value === 'reduce')
const duration = computed(() => shouldReduceMotion.value ? 0 : 450)

watchEffect(() => {
  if (!isAccessLoading.value && accessData.value && !accessData.value.has_access) {
    const toast = useToast()
    toast.add({
      title: 'Akses Ditolak',
      description: 'Anda tidak memiliki akses aktif untuk membaca buku ini.',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
    router.replace('/dashboard/riwayat')
  }
})

const pdfUrl = computed(() => {
  if (filesData.value && filesData.value.length > 0) {
    return filesData.value[0]?.file_path
  }
  return null
})

const goToHistory = () => {
  router.push('/dashboard/riwayat')
}
</script>

<template>
  <div class="relative min-h-[calc(100vh-4rem)] flex flex-col">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 bg-default dark:bg-default"
    />
    
    <div class="flex items-center justify-between p-4 bg-default border-b border-default shadow-sm shrink-0">
      <UButton
        icon="i-lucide-arrow-left"
        label="Kembali ke Riwayat"
        variant="ghost"
        color="neutral"
        @click="goToHistory"
      />
      
      <UBadge v-if="pdfUrl" color="primary" variant="subtle" icon="i-lucide-book-open">
        Mode Membaca
      </UBadge>
    </div>

    <div class="flex-1 flex flex-col relative bg-neutral-900/5">
      <div v-if="isAccessLoading || isFilesLoading" class="absolute inset-0 flex items-center justify-center">
        <UIcon name="i-lucide-loader-2" class="w-10 h-10 animate-spin text-primary" />
      </div>
      
      <template v-else-if="accessData?.has_access">
        <div v-if="pdfUrl" class="w-full h-full flex-1">
          <object :data="pdfUrl" type="application/pdf" class="w-full h-full min-h-[80vh]">
            <p class="text-center p-8">
              Browser Anda tidak mendukung pratinjau PDF. 
              <a :href="pdfUrl" target="_blank" class="text-primary underline">Unduh file PDF di sini</a>.
            </p>
          </object>
        </div>
        <div v-else class="flex items-center justify-center flex-1">
          <UAlert
            color="warning"
            variant="subtle"
            title="File Tidak Ditemukan"
            description="Buku digital ini belum memiliki file lampiran yang valid."
          />
        </div>
      </template>
    </div>
  </div>
</template>
