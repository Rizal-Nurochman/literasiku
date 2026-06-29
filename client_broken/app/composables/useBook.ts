import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Book, PaginatedBooks } from '#shared/types/book'
import type { BookInput } from '#shared/schemas/book.schema'
import type { ApiResponse } from '#shared/types/api'

export const useBook = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const router = useRouter()
  const session = useCookie<string | null>('literasiku_session')
  const config = useRuntimeConfig()

  const getHeaders = () => ({
    'Authorization': session.value ? `Bearer ${session.value}` : ''
  })

  // We use Nitro proxy or direct Go backend call depending on setup.
  // Since useAuth calls /api/auth/me which is a nitro endpoint, but Go API is at goApiBaseUrl
  // Let's assume we call Go API directly or through a Nitro proxy.
  // For the sake of this, we will call Go API directly using config.public or server API.
  // If we don't have nitro endpoints for books, we call Go API directly.
  const baseURL = config.public?.goApiBaseUrl || 'http://localhost:8080'

  const useBooksQuery = (page: Ref<number>, limit: Ref<number>, search: Ref<string>) => {
    return useQuery({
      queryKey: ['books', page, limit, search],
      queryFn: () => $fetch<ApiResponse<PaginatedBooks>>(`${baseURL}/api/v1/books`, {
        query: {
          page: page.value,
          limit: limit.value,
          search: search.value
        }
      })
    })
  }

  const useBookDetailQuery = (id: number) => {
    return useQuery({
      queryKey: ['book', id],
      queryFn: () => $fetch<ApiResponse<Book>>(`${baseURL}/api/v1/books/${id}`),
      enabled: !!id
    })
  }

  const createBookMutation = useMutation({
    mutationFn: (input: BookInput) => $fetch<ApiResponse<Book>>(`${baseURL}/api/v1/books`, {
      method: 'POST',
      headers: getHeaders(),
      body: input
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.add({ title: 'Buku berhasil ditambahkan', color: 'success', icon: 'i-lucide-circle-check' })
      router.push('/admin/buku')
    },
    onError: (error: any) => {
      toast.add({ title: 'Gagal menambahkan buku', description: error.message, color: 'error', icon: 'i-lucide-circle-x' })
    }
  })

  const updateBookMutation = useMutation({
    mutationFn: ({ id, input }: { id: number, input: Partial<BookInput> }) => $fetch<ApiResponse<Book>>(`${baseURL}/api/v1/books/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: input
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['book', variables.id] })
      toast.add({ title: 'Buku berhasil diperbarui', color: 'success', icon: 'i-lucide-circle-check' })
      router.push('/admin/buku')
    },
    onError: (error: any) => {
      toast.add({ title: 'Gagal memperbarui buku', description: error.message, color: 'error', icon: 'i-lucide-circle-x' })
    }
  })

  const deleteBookMutation = useMutation({
    mutationFn: (id: number) => $fetch<ApiResponse<null>>(`${baseURL}/api/v1/books/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.add({ title: 'Buku berhasil dihapus', color: 'success', icon: 'i-lucide-trash' })
    },
    onError: (error: any) => {
      toast.add({ title: 'Gagal menghapus buku', description: error.message, color: 'error', icon: 'i-lucide-circle-x' })
    }
  })

  // Action for AI Embedding
  const embedBookMutation = useMutation({
    mutationFn: ({ bookId, pdfUrl }: { bookId: number, pdfUrl: string }) => $fetch('/api/ai/embed-book', {
      method: 'POST',
      body: { bookId, pdfUrl }
    }),
    onSuccess: () => {
      toast.add({ title: 'AI Embedding berhasil diproses', color: 'success', icon: 'i-lucide-brain-circuit' })
    },
    onError: (error: any) => {
      toast.add({ title: 'Gagal memproses AI Embedding', description: error.message, color: 'error', icon: 'i-lucide-circle-x' })
    }
  })

  return {
    useBooksQuery,
    useBookDetailQuery,
    createBookMutation,
    updateBookMutation,
    deleteBookMutation,
    embedBookMutation
  }
}
