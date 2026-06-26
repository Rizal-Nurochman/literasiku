package repository

import (
	"errors"
    "fmt"
	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

type (
	AuthRepository interface {
		Create(user *entities.User) error
		FindByEmail(email string) (*entities.User, error)
		FindByID(id uint) (*entities.User, error)
	}

	authRepository struct {
		db *gorm.DB
	}
)

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) Create(user *entities.User) error {
	fmt.Printf("%+v\n", *user)
	fmt.Printf("MembershipNumber: %#v\n", user.MembershipNumber)

	return r.db.Create(user).Error
}

func (r *authRepository) FindByEmail(email string) (*entities.User, error) {
	var user entities.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) FindByID(id uint) (*entities.User, error) {
	var user entities.User
	if err := r.db.Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	return &user, nil
}
