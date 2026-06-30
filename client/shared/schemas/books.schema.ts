import { z } from 'zod'

export const BOOK_STATUS = [
  'ACTIVE',
  'INACTIVE',
  'DAMAGED',
  'LOST'
] as const

export const createBookSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul wajib diisi')
    .max(255, 'Judul maksimal 255 karakter'),

  author: z
    .string()
    .min(1, 'Penulis wajib diisi')
    .max(100, 'Nama penulis maksimal 100 karakter'),

  publisher: z
    .string()
    .max(100, 'Nama penerbit maksimal 100 karakter')
    .default(''),

  year_published: z
    .number({
        message: 'Tahun terbit wajib diisi'
    })
    .int()
    .min(1000)
    .max(2100),

  isbn: z
    .string()
    .max(20, 'ISBN maksimal 20 karakter')
    .default(''),

  category_id: z
  .number({
    message: 'Kategori wajib dipilih'
  })
  .positive(),

  physical_stock: z
    .number()
    .int()
    .min(0),

  is_physical_available: z.boolean(),

  is_digital_available: z.boolean(),

  status: z.enum(BOOK_STATUS).default('ACTIVE')
})

export const updateBookSchema = createBookSchema.partial()

export const booksSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().default('')
})

export type CreateBookInput = z.infer<typeof createBookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>
export type BooksSearchInput = z.infer<typeof booksSearchSchema>