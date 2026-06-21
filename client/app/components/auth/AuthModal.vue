<script setup lang="ts">
import { loginSchema, registerSchema } from '#shared/schemas/auth.schema'
import type { LoginInput, RegisterInput } from '#shared/schemas/auth.schema'

const {
  authModalOpen,
  authModalMode,
  loginMutation,
  registerMutation
} = useAuth()

const isLogin = computed(() => authModalMode.value === 'login')

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

const submitLabel = computed(() => isLogin.value ? 'Masuk' : 'Daftar')
const title = computed(() => isLogin.value ? 'Masuk ke Literasiku' : 'Daftar Akun Literasiku')
const description = computed(() => isLogin.value ? 'Gunakan akun anggota perpustakaan untuk melanjutkan.' : 'Buat akun anggota untuk mulai mengakses katalog digital.')

const handleSubmit = async (event: { data: LoginInput | RegisterInput }) => {
  if (isLogin.value) {
    await loginMutation.mutateAsync(event.data as LoginInput)
    return
  }

  await registerMutation.mutateAsync(event.data as RegisterInput)
}
</script>

<template>
  <UModal
    v-model:open="authModalOpen"
    :title="title"
    :description="description"
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="mutationError"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="mutationError"
        />

        <UAuthForm
          :key="authModalMode"
          :fields="fields"
          :schema="isLogin ? loginSchema : registerSchema"
          :submit="{ label: submitLabel, block: true, color: 'primary' }"
          :loading="isLogin ? loginMutation.isPending.value : registerMutation.isPending.value"
          @submit="handleSubmit"
        >
          <template #footer>
            <p class="text-sm text-muted text-center">
              {{ isLogin ? 'Belum punya akun?' : 'Sudah punya akun?' }}

              <UButton
                variant="link"
                color="primary"
                class="px-1"
                :label="isLogin ? 'Daftar' : 'Masuk'"
                @click="authModalMode = isLogin ? 'register' : 'login'"
              />
            </p>
          </template>
        </UAuthForm>
      </div>
    </template>
  </UModal>
</template>
