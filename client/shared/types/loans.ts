export interface LoanResponse {
  id: number
  user_id: number
  book_id: number
  borrow_date: string
  due_date: string
  return_date?: string
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'LOST'
  fine_amount: number
  fine_status: 'NONE' | 'UNPAID' | 'PAID'
  created_at: string
  updated_at: string
}

export interface DigitalLoanResponse {
  id: number
  user_id: number
  book_id: number
  access_status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface CreateLoanRequest {
  book_id: number
  due_days?: number
}

export interface CreateDigitalLoanRequest {
  book_id: number
  due_days?: number
}
