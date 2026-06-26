export interface AuthUser {
  id: number
  username: string
  full_name: string
  email: string
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
}

export interface AuthSession {
  access_token: string
  token_type: 'Bearer'
  user: AuthUser
}
