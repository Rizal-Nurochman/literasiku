import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(50, 'Maksimal 50 karakter')
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

export const updateCategorySchema = createCategorySchema

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
