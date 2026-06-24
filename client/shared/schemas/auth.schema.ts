import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({
    message: 'Format email tidak valid'
  }),
  password: z.string().min(8, {
    message: 'Password minimal harus 8 karakter'
  })
})

export const registerSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama minimal harus 2 karakter'
  }),
  email: z.string().email({
    message: 'Format email tidak valid'
  }),
  password: z.string().min(8, {
    message: 'Password minimal harus 8 karakter'
  }),
  confirmPassword: z.string().min(8, {
    message: 'Konfirmasi password minimal harus 8 karakter'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak sama',
  path: ['confirmPassword']
})

export type LoginInput = z.infer<typeof loginSchema>

export type RegisterFormInput = z.infer<typeof registerSchema>

export type RegisterInput = Omit<RegisterFormInput, 'confirmPassword'>