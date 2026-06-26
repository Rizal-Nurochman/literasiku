package repository

import (
	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll(page, limit int, search string, role string) ([]entities.User, int64, error)
	FindByID(id uint) (*entities.User, error)
	Update(user *entities.User) error
	Delete(id uint) error
	ExistsByEmail(email string, excludeID *uint) (bool, error)
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindAll(page, limit int, search string, role string) ([]entities.User, int64, error) {
	var users []entities.User
	var total int64

	query := r.db.Model(&entities.User{})

	if search != "" {
		term := "%" + search + "%"
		query = query.Where("full_name ILIKE ? OR email ILIKE ? OR membership_number ILIKE ?", term, term, term)
	}

	if role != "" {
		query = query.Where("role = ?", role)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&users).Error
	return users, total, err
}

func (r *userRepository) FindByID(id uint) (*entities.User, error) {
	var user entities.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Update(user *entities.User) error {
	return r.db.Save(user).Error
}

func (r *userRepository) Delete(id uint) error {
	return r.db.Delete(&entities.User{}, id).Error
}

func (r *userRepository) ExistsByEmail(email string, excludeID *uint) (bool, error) {
	var count int64
	query := r.db.Model(&entities.User{}).Where("email = ?", email)
	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}
	err := query.Count(&count).Error
	return count > 0, err
}
