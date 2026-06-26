package dto

import "time"

type UpdateUserRequest struct {
	FullName    string `json:"full_name" binding:"omitempty,min=1,max=100"`
	Username    string `json:"username" binding:"omitempty,min=1,max=50"`
	Email       string `json:"email" binding:"omitempty,email,max=100"`
	PhoneNumber string `json:"phone_number" binding:"omitempty,max=20"`
	Address     string `json:"address"`
	Status      string `json:"status" binding:"omitempty,oneof=ACTIVE INACTIVE BLOCKED"`
}

type PaginatedResponse struct {
	Data       any   `json:"data"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

type UserResponse struct {
	ID               uint      `json:"id"`
	Role             string    `json:"role"`
	Username         string    `json:"username"`
	FullName         string    `json:"full_name"`
	Email            string    `json:"email"`
	MembershipNumber string    `json:"membership_number"`
	IdentityNumber   string    `json:"identity_number"`
	Address          string    `json:"address"`
	PhoneNumber      string    `json:"phone_number"`
	Status           string    `json:"status"`
	CreatedAt        time.Time `json:"created_at"`
}
