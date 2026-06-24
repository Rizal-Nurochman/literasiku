<script setup lang="ts">
import { loginSchema, registerSchema } from '#shared/schemas/auth.schema'
import type { LoginInput, RegisterInput } from '#shared/schemas/auth.schema'

const props = defineProps<{
  mode: 'login' | 'register'
}>()

const {
  loginMutation,
  registerMutation
} = useAuth()

const isLogin = computed(() => props.mode === 'login')

const fields = computed(() => {
  const common = [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'nama@kampus.ac.id',
      required: true
    },
    {
      name: 'password',
      type: 'password',
      label: 'Kata sandi',
      placeholder: 'Minimal 8 karakter',
      required: true
    }
  ]

  if (isLogin.value) {
    return common
  }

  return [
    {
      name: 'name',
      type: 'text',
      label: 'Nama lengkap',
      placeholder: 'Nama anggota',
      required: true
    },
    ...common
  ]
})

const mutationError = computed(() => {
  const error = isLogin.value ? loginMutation.error.value : registerMutation.error.value

  if (!error) {
    return ''
  }

  return 'Periksa kembali data akun yang Anda masukkan.'
})

const schema = computed(() => isLogin.value ? loginSchema : registerSchema)
const loading = computed(() => isLogin.value ? loginMutation.isPending.value : registerMutation.isPending.value)
const submitLabel = computed(() => isLogin.value ? 'Masuk' : 'Daftar')
const title = computed(() => isLogin.value ? 'Masuk ke Literasiku' : 'Buat Akun Literasiku')
const description = computed(() => isLogin.value ? 'Lanjutkan akses katalog, peminjaman, dan bacaan digital Anda.' : 'Daftar untuk mulai mencari buku, membaca PDF, dan bertanya ke AI.')
const targetLink = computed(() => isLogin.value ? '/auth/register' : '/auth/login')
const targetLabel = computed(() => isLogin.value ? 'Daftar' : 'Masuk')
const prompt = computed(() => isLogin.value ? 'Belum punya akun?' : 'Sudah punya akun?')

const handleSubmit = async (event: { data: LoginInput | RegisterInput }) => {
  if (isLogin.value) {
    await loginMutation.mutateAsync(event.data as LoginInput)
  } else {
    await registerMutation.mutateAsync(event.data as RegisterInput)
  }

  await navigateTo('/')
}
</script>

<template>
  <UCard
    class="border-default/80 bg-default/90 shadow-2xl shadow-primary/10 backdrop-blur"
    :ui="{ body: 'p-6 sm:p-8' }"
  >
    <div class="mb-6 space-y-2">

      <h2 class="text-2xl font-bold tracking-tight text-highlighted">
        {{ title }}
      </h2>

      <p class="text-sm leading-6 text-muted">
        {{ description }}
      </p>
    </div>

    <div class="space-y-4">
      <UAlert
        v-if="mutationError"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="mutationError"
      />

      <UAuthForm
        :key="mode"
        :fields="fields"
        :schema="schema"
        :submit="{ label: submitLabel, block: true, color: 'primary', size: 'lg' }"
        :loading="loading"
        @submit="handleSubmit"
      >
        <template #footer>
          <p class="text-center text-sm text-muted">
            {{ prompt }}

            <UButton
              :to="targetLink"
              variant="link"
              color="primary"
              class="px-1"
              :label="targetLabel"
            />
          </p>
        </template>
      </UAuthForm>
    </div>
  </UCard>
</template>
