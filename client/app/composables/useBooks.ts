import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { BookResponse, BooksResponse, CreateBookRequest, UpdateBookRequest } from '#shared/types/books'

export const useBooks = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const BOOK_KEY = 'books'

  const useBooksList = (params: {
    page: Ref<number>
    limit: Ref<number>
    search: Ref<string>
    categoryId?: Ref<number | undefined>
  }) => {
    return useQuery({
      queryKey: [BOOK_KEY, 'list', params.page, params.limit, params.search, params.categoryId],
      queryFn: () => $fetch<BooksResponse>('/api/books', {
        query: {
          page: params.page.value,
          limit: params.limit.value,
          search: params.search.value || undefined,
          category_id: params.categoryId?.value || undefined
        }
      })
    })
  }

  const useBookDetail = (id: Ref<number | string>) => {
    return useQuery({
      queryKey: [BOOK_KEY, 'detail', id],
      queryFn: () => $fetch<BookResponse>(`/api/books/${id.value}`),
      enabled: computed(() => !!id.value)
    })
  }

  const createBookMutation = useMutation({
    mutationFn: (input: CreateBookRequest) => $fetch<BookResponse>('/api/books', {
      method: 'POST',
      body: input
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOK_KEY] })
      toast.add({
        title: 'Buku berhasil ditambahkan',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })
    },
    onError: (error: any) => {
      toast.add({
        title: 'Gagal menambahkan buku',
        description: error?.data?.statusMessage ?? error?.message ?? 'Terjadi kesalahan',
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
    }
  })

  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookRequest }) =>
      $fetch<BookResponse>(`/api/books/${id}`, {
        method: 'PATCH',
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOK_KEY] })
      toast.add({
        title: 'Buku berhasil diperbarui',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })
    },
    onError: (error: any) => {
      toast.add({
        title: 'Gagal memperbarui buku',
        description: error?.data?.statusMessage ?? error?.message ?? 'Terjadi kesalahan',
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
    }
  })

  const deleteBookMutation = useMutation({
    mutationFn: (id: number) => $fetch(`/api/books/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOK_KEY] })
      toast.add({
        title: 'Buku berhasil dihapus',
        color: 'success',
        icon: 'i-lucide-circle-check'
      })
    },
    onError: (error: any) => {
      toast.add({
        title: 'Gagal menghapus buku',
        description: error?.data?.statusMessage ?? error?.message ?? 'Terjadi kesalahan',
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
    }
  })

  return {
    useBooksList,
    useBookDetail,
    createBookMutation,
    updateBookMutation,
    deleteBookMutation
  }
}