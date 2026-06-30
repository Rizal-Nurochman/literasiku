export type CategoryResponse = {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export type CategoriesResponse = {
  data: CategoryResponse[]
  page: number
  limit: number
  total: number
  total_pages: number
}
