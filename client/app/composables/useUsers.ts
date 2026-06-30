import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { UsersResponse, UserResponse } from '#shared/types/users'
import type { UpdateUserInput } from '#shared/schemas/users.schema'
import type { Ref } from 'vue'

export const useUsers = (params?: { page?: Ref<number>, limit?: Ref<number>, search?: Ref<string>, role?: Ref<string> }) => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const fetch = useRequestFetch()

  const queryKey = computed(() => ['users', params?.page?.value, params?.limit?.value, params?.search?.value, params?.role?.value])

  const usersQuery = useQuery({
    queryKey,
    queryFn: () => {
      const searchParams = new URLSearchParams()
      if (params?.page?.value) searchParams.set('page', String(params.page.value))
      if (params?.limit?.value) searchParams.set('limit', String(params.limit.value))
      if (params?.search?.value) searchParams.set('search', params.search.value)
      if (params?.role?.value) searchParams.set('role', params.role.value)
      
      return fetch<UsersResponse>(`/api/users?${searchParams.toString()}`)
    }
  })

  const useMeQuery = () => useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => fetch<UserResponse>('/api/users/me')
  })

  const updateMeMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => fetch<UserResponse>('/api/users/me', {
      method: 'PATCH',
      body: data
    }),
    onSuccess: () => {
      toast.add({ title: 'Profil berhasil diperbarui', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal memperbarui profil', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateUserInput }) => fetch<UserResponse>(`/api/users/${id}`, {
      method: 'PATCH',
      body: data
    }),
    onSuccess: () => {
      toast.add({ title: 'Pengguna berhasil diperbarui', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal memperbarui pengguna', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/users/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast.add({ title: 'Pengguna berhasil dihapus', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal menghapus pengguna', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  return {
    users: computed(() => usersQuery.data.value?.data ?? []),
    total: computed(() => usersQuery.data.value?.total ?? 0),
    totalPages: computed(() => usersQuery.data.value?.total_pages ?? 0),
    isLoading: computed(() => usersQuery.isLoading.value),
    isError: computed(() => usersQuery.isError.value),
    error: computed(() => usersQuery.error.value),
    useMeQuery,
    updateMeMutation,
    updateMutation,
    deleteMutation
  }
}
