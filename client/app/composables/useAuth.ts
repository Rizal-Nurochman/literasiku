import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { AuthSession, AuthUser } from '#shared/types/auth'
import type { LoginInput, RegisterInput } from '#shared/schemas/auth.schema'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const session = useCookie<string | null>('literasiku_session', {
    sameSite: 'lax',
    default: () => null
  })
  const authModalOpen = useState('auth-modal-open', () => false)
  const authModalMode = useState<'login' | 'register'>('auth-modal-mode', () => 'login')

  const authQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => $fetch<AuthUser>('/api/auth/me', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
    }),
    enabled: computed(() => Boolean(session.value))
  })

  const setSession = async (payload: AuthSession, message: string) => {
    session.value = payload.access_token
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    authModalOpen.value = false
    toast.add({
      title: message,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })
  }

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => $fetch<ApiResponse<AuthSession>>('/api/auth/login', {
      method: 'POST',
      body: input
    }),
    onSuccess: payload => setSession(payload.data, 'Berhasil masuk, selamat datang kembali')
  })

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => $fetch<ApiResponse<AuthSession>>('/api/auth/register', {
      method: 'POST',
      body: input
    }),
    onSuccess: payload => setSession(payload.data, 'Akun berhasil dibuat')
  })

  const logoutMutation = useMutation({
    mutationFn: () => $fetch('/api/auth/logout', {
      method: 'POST'
    }),
    onSuccess: async () => {
      session.value = null
      queryClient.setQueryData(['auth', 'me'], null)
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.add({
        title: 'Anda sudah keluar',
        color: 'neutral',
        icon: 'i-lucide-log-out'
      })
    }
  })

  const openAuthModal = (mode: 'login' | 'register') => {
    authModalMode.value = mode
    authModalOpen.value = true
  }

  const closeAuthModal = () => {
    authModalOpen.value = false
  }

  return {
    user: computed(() => authQuery.data.value ?? null),
    isAuthenticated: computed(() => Boolean(authQuery.data.value)),
    isLoadingSession: computed(() => authQuery.isLoading.value),
    authModalOpen,
    authModalMode,
    loginMutation,
    registerMutation,
    logoutMutation,
    openAuthModal,
    closeAuthModal
  }
}
