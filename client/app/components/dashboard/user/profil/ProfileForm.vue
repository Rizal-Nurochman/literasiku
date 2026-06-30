<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { updateUserSchema, type UpdateUserInput } from '#shared/schemas/users.schema'
import type { UserResponse } from '#shared/types/users'

const props = defineProps<{
  user?: UserResponse
}>()

const emit = defineEmits<{
  (e: 'submit', data: UpdateUserInput): void
}>()

const state = ref<UpdateUserInput>({
  full_name: '',
  username: '',
  email: '',
  phone_number: '',
  address: ''
})

watch(() => props.user, (newUser) => {
  if (newUser) {
    state.value = {
      full_name: newUser.full_name || '',
      username: newUser.username || '',
      email: newUser.email || '',
      phone_number: newUser.phone_number || '',
      address: newUser.address || ''
    }
  }
}, { immediate: true })

const onSubmit = (event: FormSubmitEvent<UpdateUserInput>) => {
  emit('submit', event.data)
}
</script>

<template>
  <UForm
    :schema="updateUserSchema"
    :state="state"
    @submit="onSubmit"
    class="space-y-6"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UFormField label="Nama Lengkap" name="full_name" required>
        <UInput v-model="state.full_name" placeholder="Masukkan nama lengkap" icon="i-lucide-user" class="w-full" />
      </UFormField>

      <UFormField label="Username" name="username" required>
        <UInput v-model="state.username" placeholder="Masukkan username" icon="i-lucide-at-sign" class="w-full" />
      </UFormField>

      <UFormField label="Email" name="email" required>
        <UInput v-model="state.email" type="email" placeholder="Masukkan alamat email" icon="i-lucide-mail" class="w-full" />
      </UFormField>

      <UFormField label="Nomor Telepon" name="phone_number">
        <UInput v-model="state.phone_number" placeholder="Masukkan nomor telepon" icon="i-lucide-phone" class="w-full" />
      </UFormField>

      <UFormField label="Alamat Lengkap" name="address" class="md:col-span-2">
        <UTextarea v-model="state.address" placeholder="Masukkan alamat lengkap tempat tinggal" :rows="3" class="w-full" />
      </UFormField>
    </div>

    <div class="flex justify-end pt-4 border-t border-default">
      <UButton type="submit" label="Simpan Perubahan" color="primary" icon="i-lucide-save" />
    </div>
  </UForm>
</template>
