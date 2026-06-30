import { z } from 'zod'

export const updateUserSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap wajib diisi').max(100, 'Maksimal 100 karakter').optional(),
  username: z.string().min(3, 'Minimal 3 karakter').max(50, 'Maksimal 50 karakter').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  phone_number: z.string().max(20, 'Maksimal 20 karakter').optional(),
  address: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional()
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
