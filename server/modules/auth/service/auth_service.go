package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/literasiKu/database/entities"
	"github.com/literasiKu/modules/auth/dto"
	"github.com/literasiKu/modules/auth/repository"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(ctx context.Context, req dto.RegisterRequest) (dto.TokenResponse, error)
	Login(ctx context.Context, req dto.LoginRequest) (dto.TokenResponse, error)
	Logout(ctx context.Context, userID uint) error
}

type authService struct {
	authRepo   repository.AuthRepository
	jwtService JWTService
}

func NewAuthService(authRepo repository.AuthRepository, jwtService JWTService) AuthService {
	return &authService{
		authRepo:   authRepo,
		jwtService: jwtService,
	}
}

func (s *authService) Register(ctx context.Context, req dto.RegisterRequest) (dto.TokenResponse, error) {
	existingByEmail, err := s.authRepo.FindByEmail(req.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return dto.TokenResponse{}, fmt.Errorf("check email: %w", err)
	}
	if existingByEmail != nil {
		return dto.TokenResponse{}, dto.ErrEmailAlreadyExists
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return dto.TokenResponse{}, fmt.Errorf("hash password: %w", err)
	}

	user := &entities.User{
		Role:          "USER",
		Username:      req.Username,
		PasswordHash:  string(hashedPassword),
		NamaLengkap:   req.NamaLengkap,
		Email:         req.Email,
		NoKeanggotaan: req.NoKeanggotaan,
		NoIdentitas:   req.NoIdentitas,
		Alamat:        req.Alamat,
		NoTelepon:     req.NoTelepon,
		StatusAkun:    "AKTIF",
	}

	if err := s.authRepo.Create(user); err != nil {
		return dto.TokenResponse{}, fmt.Errorf("create user: %w", err)
	}

	token, err := s.jwtService.GenerateToken(user.IDUser, user.Role)
	if err != nil {
		return dto.TokenResponse{}, fmt.Errorf("generate token: %w", err)
	}

	return dto.TokenResponse{
		AccessToken: token,
		TokenType:   "Bearer",
		User:        toUserResponse(user),
	}, nil
}

func (s *authService) Login(ctx context.Context, req dto.LoginRequest) (dto.TokenResponse, error) {
	user, err := s.authRepo.FindByEmail(req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return dto.TokenResponse{}, dto.ErrInvalidCredentials
		}
		return dto.TokenResponse{}, fmt.Errorf("find user: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return dto.TokenResponse{}, dto.ErrInvalidCredentials
	}

	switch user.StatusAkun {
	case "BLOKIR":
		return dto.TokenResponse{}, dto.ErrUserBlocked
	case "NONAKTIF":
		return dto.TokenResponse{}, dto.ErrUserInactive
	}

	token, err := s.jwtService.GenerateToken(user.IDUser, user.Role)
	if err != nil {
		return dto.TokenResponse{}, fmt.Errorf("generate token: %w", err)
	}

	return dto.TokenResponse{
		AccessToken: token,
		TokenType:   "Bearer",
		User:        toUserResponse(user),
	}, nil
}

func (s *authService) Logout(ctx context.Context, userID uint) error {
	_, err := s.authRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return dto.ErrEmailNotFound
		}
		return err
	}
	return nil
}

func toUserResponse(u *entities.User) dto.UserResponse {
	return dto.UserResponse{
		IDUser:        u.IDUser,
		Username:      u.Username,
		NamaLengkap:   u.NamaLengkap,
		Email:         u.Email,
		Role:          u.Role,
		StatusAkun:    u.StatusAkun,
		NoKeanggotaan: u.NoKeanggotaan,
		NoIdentitas:   u.NoIdentitas,
		Alamat:        u.Alamat,
		NoTelepon:     u.NoTelepon,
		CreatedAt:     u.CreatedAt,
	}
}
