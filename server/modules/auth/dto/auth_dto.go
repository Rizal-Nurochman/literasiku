package dto

import (
	"errors"
	"time"
)

const (
	MESSAGE_SUCCESS_REGISTER_USER = "success register user"
	MESSAGE_FAILED_REGISTER_USER  = "failed register user"

	MESSAGE_SUCCESS_LOGIN = "success login"
	MESSAGE_FAILED_LOGIN  = "failed login"

	MESSAGE_SUCCESS_LOGOUT = "success logout"
	MESSAGE_FAILED_LOGOUT  = "failed logout"

	MESSAGE_FAILED_GET_DATA_FROM_BODY = "failed to get data from body"
	MESSAGE_FAILED_PROSES_REQUEST     = "failed to proses request"

	MESSAGE_FAILED_TOKEN_NOT_FOUND = "token not found"
	MESSAGE_FAILED_TOKEN_NOT_VALID = "token not valid"
	MESSAGE_FAILED_DENIED_ACCESS   = "denied access"
)

var (
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrUsernameAlreadyExists = errors.New("username already exists")
	ErrEmailNotFound        = errors.New("email not found")
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrUserBlocked          = errors.New("user account is blocked")
	ErrUserInactive         = errors.New("user account is inactive")
)

type RegisterRequest struct {
	Username  string `json:"username" binding:"required,min=3,max=50"`
	Password  string `json:"password" binding:"required,min=8,max=72"`
	FullName  string `json:"full_name" binding:"required,min=1,max=100"`
	Email     string `json:"email" binding:"required,email,max=100"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email,max=100"`
	Password string `json:"password" binding:"required,min=8,max=72"`
}

type UserResponse struct {
	ID              uint      `json:"id"`
	Username        string    `json:"username"`
	FullName        string    `json:"full_name"`
	Email           string    `json:"email"`
	Role            string    `json:"role"`
	Status          string    `json:"status"`
	MembershipNumber string    `json:"membership_number,omitempty"`
	IdentityNumber   string    `json:"identity_number,omitempty"`
	Address         string    `json:"address,omitempty"`
	PhoneNumber     string    `json:"phone_number,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

type TokenResponse struct {
	AccessToken string       `json:"access_token"`
	TokenType   string       `json:"token_type"`
	User        UserResponse `json:"user"`
}
