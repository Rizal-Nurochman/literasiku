package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/literasiKu/database/entities"
	"github.com/literasiKu/modules/category/dto"
	"github.com/literasiKu/modules/category/repository"
	"gorm.io/gorm"
)

type CategoryService interface {
	Create(ctx context.Context, req dto.CategoryRequest) (*entities.BookCategory, error)
	GetByID(ctx context.Context, id uint) (*entities.BookCategory, error)
	GetAll(ctx context.Context, page, limit int, search string) ([]entities.BookCategory, int64, error)
	Update(ctx context.Context, id uint, req dto.CategoryRequest) (*entities.BookCategory, error)
	Delete(ctx context.Context, id uint) error
}

type categoryService struct {
	categoryRepo repository.CategoryRepository
}

func NewCategoryService(categoryRepo repository.CategoryRepository) CategoryService {
	return &categoryService{categoryRepo: categoryRepo}
}

func (s *categoryService) Create(ctx context.Context, req dto.CategoryRequest) (*entities.BookCategory, error) {
	exists, err := s.categoryRepo.ExistsByName(req.Name, nil)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("category name already exists")
	}

	category := &entities.BookCategory{
		Name: req.Name,
	}

	if err := s.categoryRepo.Create(category); err != nil {
		return nil, err
	}

	return s.categoryRepo.FindByID(category.ID)
}

func (s *categoryService) GetByID(ctx context.Context, id uint) (*entities.BookCategory, error) {
	category, err := s.categoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("category not found")
		}
		return nil, err
	}
	return category, nil
}

func (s *categoryService) GetAll(ctx context.Context, page, limit int, search string) ([]entities.BookCategory, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	return s.categoryRepo.FindAll(page, limit, search)
}

func (s *categoryService) Update(ctx context.Context, id uint, req dto.CategoryRequest) (*entities.BookCategory, error) {
	category, err := s.categoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("category not found")
		}
		return nil, err
	}

	exists, err := s.categoryRepo.ExistsByName(req.Name, &id)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("category name already exists")
	}

	category.Name = req.Name

	if err := s.categoryRepo.Update(category); err != nil {
		return nil, err
	}

	return s.categoryRepo.FindByID(category.ID)
}

func (s *categoryService) Delete(ctx context.Context, id uint) error {
	_, err := s.categoryRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("category not found")
		}
		return err
	}
	return s.categoryRepo.Delete(id)
}