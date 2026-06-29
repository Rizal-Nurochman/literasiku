import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string()
    .email({ message: 'Format email tidak valid' })
    .max(100, { message: 'Email maksimal 100 karakter' }),
  password: z.string()
    .min(8, { message: 'Password minimal harus 8 karakter' })
    .max(72, { message: 'Password maksimal 72 karakter' })
})

export const registerSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username minimal harus 3 karakter' })
    .max(50, { message: 'Username maksimal 50 karakter' }),
  
  full_name: z.string()
    .min(1, { message: 'Nama lengkap minimal harus 1 karakter' })
    .max(100, { message: 'Nama lengkap maksimal 100 karakter' }),
  
  email: z.string()
    .email({ message: 'Format email tidak valid' })
    .max(100, { message: 'Email maksimal 100 karakter' }),
  
  password: z.string()
    .min(8, { message: 'Password minimal harus 8 karakter' })
    .max(72, { message: 'Password maksimal 72 karakter' }),
  
  confirmPassword: z.string()
    .min(8, { message: 'Konfirmasi password minimal harus 8 karakter' })
    .max(72, { message: 'Konfirmasi password maksimal 72 karakter' })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak sama',
  path: ['confirmPassword']
})

export type LoginInput = z.infer<typeof loginSchema>

export type RegisterFormInput = z.infer<typeof registerSchema>

// Omit confirmPassword saat akan dikirim sebagai payload ke backend
export type RegisterInput = Omit<RegisterFormInput, 'confirmPassword'>