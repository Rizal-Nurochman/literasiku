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
  })
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>