package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/literasiKu/database/entities"
	"github.com/literasiKu/modules/user/dto"
	"github.com/literasiKu/modules/user/repository"
	"gorm.io/gorm"
)

type UserService interface {
	GetAll(ctx context.Context, page, limit int, search, role string) ([]dto.UserResponse, int64, error)
	GetByID(ctx context.Context, id uint) (*dto.UserResponse, error)
	Update(ctx context.Context, id uint, req dto.UpdateUserRequest) (*dto.UserResponse, error)
	Delete(ctx context.Context, id uint) error
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) GetAll(ctx context.Context, page, limit int, search, role string) ([]dto.UserResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	users, total, err := s.userRepo.FindAll(page, limit, search, role)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]dto.UserResponse, len(users))
	for i, u := range users {
		responses[i] = toUserResponse(&u)
	}
	return responses, total, nil
}

func (s *userService) GetByID(ctx context.Context, id uint) (*dto.UserResponse, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	res := toUserResponse(user)
	return &res, nil
}

func (s *userService) Update(ctx context.Context, id uint, req dto.UpdateUserRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	if req.Email != "" && req.Email != user.Email {
		exists, err := s.userRepo.ExistsByEmail(req.Email, &id)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, fmt.Errorf("email already exists")
		}
		user.Email = req.Email
	}

	if req.FullName != "" {
		user.FullName = req.FullName
	}
	if req.Username != "" {
		user.Username = req.Username
	}
	if req.PhoneNumber != "" {
		user.PhoneNumber = req.PhoneNumber
	}
	if req.Address != "" {
		user.Address = req.Address
	}
	if req.Status != "" {
		user.Status = req.Status
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	res := toUserResponse(user)
	return &res, nil
}

func (s *userService) Delete(ctx context.Context, id uint) error {
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("user not found")
		}
		return err
	}
	return s.userRepo.Delete(id)
}

func toUserResponse(u *entities.User) dto.UserResponse {
	return dto.UserResponse{
		ID:               u.ID,
		Role:             u.Role,
		Username:         u.Username,
		FullName:         u.FullName,
		Email:            u.Email,
		MembershipNumber: u.MembershipNumber,
		IdentityNumber:   u.IdentityNumber,
		Address:          u.Address,
		PhoneNumber:      u.PhoneNumber,
		Status:           u.Status,
		CreatedAt:        u.CreatedAt,
	}
}
