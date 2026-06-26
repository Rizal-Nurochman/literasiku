export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'USER' | 'ADMIN'; 
  status: string;         
  created_at: string;
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface AuthRegister {
  username: string;
  full_name: string;
  email: string;
  password: string;
}