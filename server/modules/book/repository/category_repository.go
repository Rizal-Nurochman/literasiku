package repository

import (
	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

type BookCategoryRepository interface {
	Create(category *entities.BookCategory) error
	FindByID(id uint) (*entities.BookCategory, error)
	FindAll(page, limit int, search string) ([]entities.BookCategory, int64, error)
	Update(category *entities.BookCategory) error
	Delete(id uint) error
	ExistsByName(name string, excludeID *uint) (bool, error)
}

type bookCategoryRepository struct {
	db *gorm.DB
}

func NewBookCategoryRepository(db *gorm.DB) BookCategoryRepository {
	return &bookCategoryRepository{db: db}
}

func (r *bookCategoryRepository) Create(category *entities.BookCategory) error {
	return r.db.Create(category).Error
}

func (r *bookCategoryRepository) FindByID(id uint) (*entities.BookCategory, error) {
	var category entities.BookCategory
	err := r.db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *bookCategoryRepository) FindAll(page, limit int, search string) ([]entities.BookCategory, int64, error) {
	var categories []entities.BookCategory
	var total int64

	query := r.db.Model(&entities.BookCategory{})

	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Where("name ILIKE ?", searchTerm)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&categories).Error
	return categories, total, err
}

func (r *bookCategoryRepository) Update(category *entities.BookCategory) error {
	return r.db.Save(category).Error
}

func (r *bookCategoryRepository) Delete(id uint) error {
	return r.db.Delete(&entities.BookCategory{}, id).Error
}

func (r *bookCategoryRepository) ExistsByName(name string, excludeID *uint) (bool, error) {
	var count int64
	query := r.db.Model(&entities.BookCategory{}).Where("name = ?", name)
	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}
	err := query.Count(&count).Error
	return count > 0, err
}