package repository

import (
	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

type FileRepository interface {
	Create(file *entities.File) error
	FindByID(id uint) (*entities.File, error)
	FindByBookID(bookID uint) ([]entities.File, error)
	Update(file *entities.File) error
	Delete(id uint) error
}

type fileRepository struct {
	db *gorm.DB
}

func NewFileRepository(db *gorm.DB) FileRepository {
	return &fileRepository{db: db}
}

func (r *fileRepository) Create(file *entities.File) error {
	return r.db.Create(file).Error
}

func (r *fileRepository) FindByID(id uint) (*entities.File, error) {
	var file entities.File
	err := r.db.First(&file, id).Error
	if err != nil {
		return nil, err
	}
	return &file, nil
}

func (r *fileRepository) FindByBookID(bookID uint) ([]entities.File, error) {
	var files []entities.File
	err := r.db.Where("book_id = ?", bookID).Find(&files).Error
	return files, err
}

func (r *fileRepository) Update(file *entities.File) error {
	return r.db.Save(file).Error
}

func (r *fileRepository) Delete(id uint) error {
	return r.db.Delete(&entities.File{}, id).Error
}