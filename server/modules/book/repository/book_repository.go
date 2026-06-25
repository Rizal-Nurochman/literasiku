package repository

import (
	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

type BookRepository interface {
	Create(book *entities.Book) error
	FindByID(id uint) (*entities.Book, error)
	FindAll(page, limit int, search string, categoryID *uint) ([]entities.Book, int64, error)
	Update(book *entities.Book) error
	Delete(id uint) error
	ExistsByISBN(isbn string, excludeID *uint) (bool, error)
}

type bookRepository struct {
	db *gorm.DB
}

func NewBookRepository(db *gorm.DB) BookRepository {
	return &bookRepository{db: db}
}

func (r *bookRepository) Create(book *entities.Book) error {
	return r.db.Create(book).Error
}

func (r *bookRepository) FindByID(id uint) (*entities.Book, error) {
	var book entities.Book
	err := r.db.Preload("Category").Preload("Files").First(&book, id).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func (r *bookRepository) FindAll(page, limit int, search string, categoryID *uint) ([]entities.Book, int64, error) {
	var books []entities.Book
	var total int64

	query := r.db.Model(&entities.Book{}).Preload("Category").Preload("Files")

	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Where("title ILIKE ? OR author ILIKE ? OR isbn ILIKE ?", searchTerm, searchTerm, searchTerm)
	}

	if categoryID != nil {
		query = query.Where("category_id = ?", *categoryID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&books).Error
	return books, total, err
}

func (r *bookRepository) Update(book *entities.Book) error {
	return r.db.Save(book).Error
}

func (r *bookRepository) Delete(id uint) error {
	return r.db.Delete(&entities.Book{}, id).Error
}

func (r *bookRepository) ExistsByISBN(isbn string, excludeID *uint) (bool, error) {
	var count int64
	query := r.db.Model(&entities.Book{}).Where("isbn = ?", isbn)
	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}
	err := query.Count(&count).Error
	return count > 0, err
}