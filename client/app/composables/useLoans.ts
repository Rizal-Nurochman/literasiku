import { useMutation, useQueryClient, useQuery } from '@tanstack/vue-query'
import type { CreateLoanInput, CreateDigitalLoanInput } from '#shared/schemas/loans.schema'
import type { LoanResponse, DigitalLoanResponse } from '#shared/types/loans'
import type { PaginatedResponse } from '#shared/types/api'

export const useLoans = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const fetch = useRequestFetch()

  const useMyPhysicalLoans = (params: { page: Ref<number>, limit: Ref<number> }) => {
    return useQuery({
      queryKey: ['loans', 'physical', 'my', params.page, params.limit],
      queryFn: () => fetch<PaginatedResponse<LoanResponse>>('/api/loans/physical/my', {
        query: {
          page: params.page.value,
          limit: params.limit.value
        }
      })
    })
  }

  const useMyDigitalLoans = (params: { page: Ref<number>, limit: Ref<number> }) => {
    return useQuery({
      queryKey: ['loans', 'digital', 'my', params.page, params.limit],
      queryFn: () => fetch<PaginatedResponse<DigitalLoanResponse>>('/api/loans/digital/my', {
        query: {
          page: params.page.value,
          limit: params.limit.value
        }
      })
    })
  }

  const useAllPhysicalLoans = (params: { page: Ref<number>, limit: Ref<number>, status: Ref<string> }) => {
    return useQuery({
      queryKey: ['admin_loans', 'physical', params.page, params.limit, params.status],
      queryFn: () => {
        const query: Record<string, any> = {
          page: params.page.value,
          limit: params.limit.value
        }
        if (params.status.value && params.status.value !== 'ALL') query.status = params.status.value
        return fetch<PaginatedResponse<LoanResponse>>('/api/loans/physical', { query })
      }
    })
  }

  const useAllDigitalLoans = (params: { page: Ref<number>, limit: Ref<number>, status: Ref<string> }) => {
    return useQuery({
      queryKey: ['admin_loans', 'digital', params.page, params.limit, params.status],
      queryFn: () => {
        const query: Record<string, any> = {
          page: params.page.value,
          limit: params.limit.value
        }
        if (params.status.value && params.status.value !== 'ALL') query.status = params.status.value
        return fetch<PaginatedResponse<DigitalLoanResponse>>('/api/loans/digital', { query })
      }
    })
  }

  const useDigitalAccess = (bookId: Ref<number | string>) => {
    return useQuery({
      queryKey: ['loans', 'digital', 'access', bookId],
      queryFn: () => fetch<{ has_access: boolean }>(`/api/loans/digital/access/${bookId.value}`),
      enabled: computed(() => !!bookId.value)
    })
  }

  const borrowPhysicalMutation = useMutation({
    mutationFn: (input: CreateLoanInput) => fetch<LoanResponse>('/api/loans/physical', {
      method: 'POST',
      body: input
    }),
    onSuccess: () => {
      toast.add({ title: 'Berhasil meminjam buku fisik', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal meminjam buku', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  const borrowDigitalMutation = useMutation({
    mutationFn: (input: CreateDigitalLoanInput) => fetch<DigitalLoanResponse>('/api/loans/digital', {
      method: 'POST',
      body: input
    }),
    onSuccess: () => {
      toast.add({ title: 'Akses baca digital diberikan', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['digital_loans'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal mendapatkan akses digital', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  const returnPhysicalMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: { return_date?: string } }) => fetch<LoanResponse>(`/api/loans/physical/${id}/return`, {
      method: 'PATCH',
      body: data
    }),
    onSuccess: () => {
      toast.add({ title: 'Buku berhasil dikembalikan', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['admin_loans'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal memproses pengembalian', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  const payFineMutation = useMutation({
    mutationFn: (id: number) => fetch<LoanResponse>(`/api/loans/physical/${id}/pay-fine`, {
      method: 'PATCH'
    }),
    onSuccess: () => {
      toast.add({ title: 'Denda berhasil dibayar', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['admin_loans'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal memproses pembayaran', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  const revokeDigitalMutation = useMutation({
    mutationFn: (id: number) => fetch<DigitalLoanResponse>(`/api/loans/digital/${id}/revoke`, {
      method: 'PATCH'
    }),
    onSuccess: () => {
      toast.add({ title: 'Akses digital berhasil dicabut', color: 'success', icon: 'i-lucide-check-circle' })
      queryClient.invalidateQueries({ queryKey: ['admin_loans'] })
    },
    onError: (err: any) => {
      toast.add({ title: 'Gagal mencabut akses', description: err?.data?.message || err.message, color: 'error', icon: 'i-lucide-alert-circle' })
    }
  })

  return {
    useMyPhysicalLoans,
    useMyDigitalLoans,
    useAllPhysicalLoans,
    useAllDigitalLoans,
    useDigitalAccess,
    borrowPhysicalMutation,
    borrowDigitalMutation,
    returnPhysicalMutation,
    payFineMutation,
    revokeDigitalMutation
  }
}
