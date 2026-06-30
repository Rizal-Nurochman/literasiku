import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { CategoriesResponse, CategoryResponse } from '#shared/types/categories'
import type { CreateCategoryInput, UpdateCategoryInput } from '#shared/schemas/categories.schema'
import type { Ref } from 'vue'

export const useCategories = (params?: { page?: Ref<number>, limit?: Ref<number>, search?: Ref<string> }) => {
  const queryClient = useQueryClient()
  const toast = useToast()

  const queryKey = computed(() => ['categories', params?.page?.value, params?.limit?.value, params?.search?.value])

  const categoriesQuery = useQuery({
    queryKey,
    queryFn: () => {
      const searchParams = new URLSearchParams()
      if (params?.page?.value) searchParams.set('page', String(params.page.value))
      if (params?.limit?.value) searchParams.set('limit', String(params.limit.value))
      if (params?.search?.value) searchParams.set('search', params.search.value)
      
      return $fetch<CategoriesResponse>(`/api/categories?${searchParams.toString()}`)
    }
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateCategoryInput) => $fetch<CategoryResponse>('/api/categories', {
      method: 'POST',
      body: input
    }),
    onSuccess: () => {
      toast.add({ title: 'Kategori berhasil dibuat', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal membuat kategori', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateCategoryInput }) => $fetch<CategoryResponse>(`/api/categories/${id}`, {
      method: 'PATCH',
      body: data
    }),
    onSuccess: () => {
      toast.add({ title: 'Kategori berhasil diperbarui', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal memperbarui kategori', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => $fetch(`/api/categories/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast.add({ title: 'Kategori berhasil dihapus', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal menghapus kategori', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  return {
    categories: computed(() => categoriesQuery.data.value?.data ?? []),
    total: computed(() => categoriesQuery.data.value?.total ?? 0),
    totalPages: computed(() => categoriesQuery.data.value?.total_pages ?? 0),
    isLoading: computed(() => categoriesQuery.isLoading.value),
    isError: computed(() => categoriesQuery.isError.value),
    error: computed(() => categoriesQuery.error.value),
    createMutation,
    updateMutation,
    deleteMutation
  }
}
