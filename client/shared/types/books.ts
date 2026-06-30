export const BOOK_STATUS = [
  'ACTIVE',
  'INACTIVE',
  'DAMAGED',
  'LOST'
] as const

export type BookStatus = typeof BOOK_STATUS[number]

export type BooksQuery = {
  page: number
  limit: number
  search?: string
}

export type BookResponse = {
  id: number
  title: string
  author: string
  publisher: string
  year_published: number
  isbn: string
  category_id: number
  physical_stock: number
  is_physical_available: boolean
  is_digital_available: boolean
  status: BookStatus
  file_url: string
  created_at: string
  updated_at: string
}

export type BooksResponse = {
  data: BookResponse[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export type CreateBookRequest = {
  title: string
  author: string
  publisher: string
  year_published: number
  isbn: string
  category_id: number
  physical_stock: number
  is_physical_available: boolean
  is_digital_available: boolean
  status?: BookStatus
  file_url?: string
}

export type UpdateBookRequest = Partial<CreateBookRequest>