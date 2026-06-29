import { z } from 'zod'

export const bookSchema = z.object({
  category_id: z.number().positive('Kategori harus dipilih'),
  title: z.string().min(3, 'Judul minimal 3 karakter').max(255, 'Judul maksimal 255 karakter'),
  author: z.string().min(3, 'Penulis minimal 3 karakter').max(100, 'Penulis maksimal 100 karakter'),
  publisher: z.string().max(100, 'Penerbit maksimal 100 karakter').optional(),
  year_published: z.number().min(1900, 'Tahun tidak valid').max(new Date().getFullYear(), 'Tahun tidak valid'),
  isbn: z.string().max(20, 'ISBN maksimal 20 karakter').optional(),
  physical_stock: z.number().min(0, 'Stok tidak boleh negatif'),
  is_physical_available: z.boolean().default(true),
  is_digital_available: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DAMAGED', 'LOST']).default('ACTIVE'),
  book_url: z.string().url('URL tidak valid').optional().or(z.literal(''))
})

export type BookInput = z.infer<typeof bookSchema>
