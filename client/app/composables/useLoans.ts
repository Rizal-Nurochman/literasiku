import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { CreateLoanInput, CreateDigitalLoanInput } from '#shared/schemas/loans.schema'
import type { LoanResponse, DigitalLoanResponse } from '#shared/types/loans'

export const useLoans = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  const borrowPhysicalMutation = useMutation({
    mutationFn: (input: CreateLoanInput) => $fetch<LoanResponse>('/api/loans/physical', {
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
    mutationFn: (input: CreateDigitalLoanInput) => $fetch<DigitalLoanResponse>('/api/loans/digital', {
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

  return {
    borrowPhysicalMutation,
    borrowDigitalMutation
  }
}
