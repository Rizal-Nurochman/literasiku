export interface UserResponse {
  id: number
  username: string
  full_name: string
  email: string
  role: 'USER' | 'ADMIN'
  membership_number?: string
  identity_number?: string
  phone_number?: string
  address?: string
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  created_at: string
}

export interface UsersResponse {
  data: UserResponse[]
  page: number
  limit: number
  total: number
  total_pages: number
}
