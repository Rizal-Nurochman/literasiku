package repository

import (
	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

type PhysicalLoanRepository interface {
	Create(loan *entities.PhysicalLoan) error
	FindByID(id uint) (*entities.PhysicalLoan, error)
	FindAll(page, limit int, status string) ([]entities.PhysicalLoan, int64, error)
	FindByUserID(userID uint, page, limit int) ([]entities.PhysicalLoan, int64, error)
	HasActiveByUserID(userID uint) (bool, error)
	Update(loan *entities.PhysicalLoan) error
}

type physicalLoanRepository struct {
	db *gorm.DB
}

func NewPhysicalLoanRepository(db *gorm.DB) PhysicalLoanRepository {
	return &physicalLoanRepository{db: db}
}

func (r *physicalLoanRepository) Create(loan *entities.PhysicalLoan) error {
	return r.db.Create(loan).Error
}

func (r *physicalLoanRepository) FindByID(id uint) (*entities.PhysicalLoan, error) {
	var loan entities.PhysicalLoan
	err := r.db.Preload("Book").Preload("User").First(&loan, id).Error
	return &loan, err
}

func (r *physicalLoanRepository) FindAll(page, limit int, status string) ([]entities.PhysicalLoan, int64, error) {
	var loans []entities.PhysicalLoan
	var total int64

	query := r.db.Model(&entities.PhysicalLoan{}).Preload("Book").Preload("User")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&loans).Error
	return loans, total, err
}

func (r *physicalLoanRepository) FindByUserID(userID uint, page, limit int) ([]entities.PhysicalLoan, int64, error) {
	var loans []entities.PhysicalLoan
	var total int64

	query := r.db.Model(&entities.PhysicalLoan{}).Preload("Book").Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&loans).Error
	return loans, total, err
}

func (r *physicalLoanRepository) HasActiveByUserID(userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&entities.PhysicalLoan{}).
		Where("user_id = ? AND status IN ('BORROWED','OVERDUE')", userID).
		Count(&count).Error
	return count > 0, err
}

func (r *physicalLoanRepository) Update(loan *entities.PhysicalLoan) error {
	return r.db.Save(loan).Error
}
