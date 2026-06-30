package dto

import "time"

type CreateLoanRequest struct {
	BookID    uint `json:"book_id" binding:"required"`
	DueDays   int  `json:"due_days" binding:"omitempty,min=1,max=60"`
}

type ReturnLoanRequest struct {
	ReturnDate string `json:"return_date" binding:"omitempty"`
}

type PayFineRequest struct {
	// no payment gateway, just mark as paid
}

type LoanResponse struct {
	ID           uint       `json:"id"`
	UserID       uint       `json:"user_id"`
	UserFullName string     `json:"user_full_name"`
	Username     string     `json:"username"`
	BookID       uint       `json:"book_id"`
	BookTitle   string     `json:"book_title"`
	BorrowDate  time.Time  `json:"borrow_date"`
	DueDate     time.Time  `json:"due_date"`
	ReturnDate  *time.Time `json:"return_date"`
	Status      string     `json:"status"`
	FineAmount  float64    `json:"fine_amount"`
	FineStatus  string     `json:"fine_status"`
	CreatedAt   time.Time  `json:"created_at"`
}

type PaginatedResponse struct {
	Data       any   `json:"data"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}
