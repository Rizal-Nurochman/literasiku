package dto

import "time"

type CreateDigitalLoanRequest struct {
	BookID  uint `json:"book_id" binding:"required"`
	DueDays int  `json:"due_days" binding:"omitempty,min=1,max=30"`
}

type DigitalLoanResponse struct {
	ID           uint      `json:"id"`
	UserID       uint      `json:"user_id"`
	UserFullName string    `json:"user_full_name"`
	Username     string    `json:"username"`
	BookID       uint      `json:"book_id"`
	BookTitle    string    `json:"book_title"`
	StartDate    time.Time `json:"start_date"`
	EndDate      time.Time `json:"end_date"`
	AccessStatus string    `json:"access_status"`
	CreatedAt    time.Time `json:"created_at"`
}

type PaginatedResponse struct {
	Data       any   `json:"data"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}
