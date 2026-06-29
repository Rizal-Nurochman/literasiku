export interface BookCategory {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Book {
  id: number
  category_id: number
  title: string
  author: string
  publisher: string
  year_published: number
  isbn: string
  physical_stock: number
  is_physical_available: boolean
  is_digital_available: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'DAMAGED' | 'LOST'
  book_url: string
  created_at: string
  updated_at: string
  category?: BookCategory
}

export interface PaginatedBooks {
  data: Book[]
  page: number
  limit: number
  total: number
  total_pages: number
}
