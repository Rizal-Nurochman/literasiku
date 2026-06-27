package repository

import (
	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

type DigitalLoanRepository interface {
	Create(loan *entities.DigitalLoan) error
	FindByID(id uint) (*entities.DigitalLoan, error)
	FindAll(page, limit int, status string) ([]entities.DigitalLoan, int64, error)
	FindByUserID(userID uint, page, limit int) ([]entities.DigitalLoan, int64, error)
	HasActiveByUserAndBook(userID, bookID uint) (bool, error)
	FindActiveByUserAndBook(userID, bookID uint) (*entities.DigitalLoan, error)
	Update(loan *entities.DigitalLoan) error
}

type digitalLoanRepository struct {
	db *gorm.DB
}

func NewDigitalLoanRepository(db *gorm.DB) DigitalLoanRepository {
	return &digitalLoanRepository{db: db}
}

func (r *digitalLoanRepository) Create(loan *entities.DigitalLoan) error {
	return r.db.Create(loan).Error
}

func (r *digitalLoanRepository) FindByID(id uint) (*entities.DigitalLoan, error) {
	var loan entities.DigitalLoan
	err := r.db.Preload("Book").Preload("User").First(&loan, id).Error
	return &loan, err
}

func (r *digitalLoanRepository) FindAll(page, limit int, status string) ([]entities.DigitalLoan, int64, error) {
	var loans []entities.DigitalLoan
	var total int64

	query := r.db.Model(&entities.DigitalLoan{}).Preload("Book").Preload("User")
	if status != "" {
		query = query.Where("access_status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&loans).Error
	return loans, total, err
}

func (r *digitalLoanRepository) FindByUserID(userID uint, page, limit int) ([]entities.DigitalLoan, int64, error) {
	var loans []entities.DigitalLoan
	var total int64

	query := r.db.Model(&entities.DigitalLoan{}).Preload("Book").Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&loans).Error
	return loans, total, err
}

func (r *digitalLoanRepository) HasActiveByUserAndBook(userID, bookID uint) (bool, error) {
	var count int64
	err := r.db.Model(&entities.DigitalLoan{}).
		Where("user_id = ? AND book_id = ? AND access_status = 'ACTIVE' AND end_date > NOW()", userID, bookID).
		Count(&count).Error
	return count > 0, err
}

func (r *digitalLoanRepository) FindActiveByUserAndBook(userID, bookID uint) (*entities.DigitalLoan, error) {
	var loan entities.DigitalLoan
	err := r.db.Where("user_id = ? AND book_id = ? AND access_status = 'ACTIVE'", userID, bookID).First(&loan).Error
	if err != nil {
		return nil, err
	}
	return &loan, nil
}

func (r *digitalLoanRepository) Update(loan *entities.DigitalLoan) error {
	return r.db.Save(loan).Error
}
