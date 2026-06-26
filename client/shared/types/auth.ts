export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'anggota' | 'admin'
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export interface AuthRegister{
  
}
