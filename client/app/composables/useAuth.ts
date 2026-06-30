import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { AuthSession, AuthUser } from '#shared/types/auth'
import type { LoginInput, RegisterInput } from '#shared/schemas/auth.schema'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const toast = useToast()
  const session = useCookie<string | null>('literasiku_session', {
    sameSite: 'lax',
    default: () => null
  })
  const authModalOpen = useState('auth-modal-open', () => false)
  const authModalMode = useState<'login' | 'register'>('auth-modal-mode', () => 'login')

  const getHeaders = () => ({
    'Authorization': session.value ? `Bearer ${session.value}` : ''
  })

  const authQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))

      const raw = localStorage.getItem('literasiku_user')

      return raw ? JSON.parse(raw) as AuthUser : null
    },
    enabled: computed(() => !!session.value)
  })

  const setSession = (payload: AuthSession, message: string) => {
    session.value = payload.access_token
    
    if (payload.user) {
      localStorage.setItem('literasiku_user', JSON.stringify(payload.user))
      queryClient.setQueryData(['auth', 'me'], payload.user)
    }
    
    authModalOpen.value = false
    toast.add({ title: message, color: 'success', icon: 'i-lucide-circle-check' })
  }

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => $fetch<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: input
    }),
    onSuccess: payload => setSession(payload, 'Berhasil masuk')
  })

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => $fetch<AuthSession>('/api/auth/register', {
      method: 'POST',
      body: input
    }),
    onSuccess: payload => setSession(payload, 'Akun berhasil dibuat')
  })

  const logoutMutation = useMutation({
    mutationFn: () => $fetch('/api/auth/logout', {
      method: 'POST',
      headers: getHeaders()
    }),
    onSuccess: async () => {
      session.value = null
      queryClient.setQueryData(['auth', 'me'], null)
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.add({
        title: 'Suksess logout',
        color: 'info',
        icon: 'i-lucide-log-out'
      })

      await router.replace('/auth/login')
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