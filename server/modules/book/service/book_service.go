package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/literasiKu/database/entities"
	"github.com/literasiKu/modules/book/dto"
	"github.com/literasiKu/modules/book/repository"
	"gorm.io/gorm"
)

type BookService interface {
	Create(ctx context.Context, req dto.BookRequest) (*entities.Book, error)
	GetByID(ctx context.Context, id uint) (*entities.Book, error)
	GetAll(ctx context.Context, page, limit int, search string, categoryID *uint) ([]entities.Book, int64, error)
	Update(ctx context.Context, id uint, req dto.BookRequest) (*entities.Book, error)
	Delete(ctx context.Context, id uint) error
}

type bookService struct {
	bookRepo     repository.BookRepository
	categoryRepo repository.BookCategoryRepository
}

func NewBookService(bookRepo repository.BookRepository, categoryRepo repository.BookCategoryRepository) BookService {
	return &bookService{
		bookRepo:     bookRepo,
		categoryRepo: categoryRepo,
	}
}

func (s *bookService) Create(ctx context.Context, req dto.BookRequest) (*entities.Book, error) {
	if _, err := s.categoryRepo.FindByID(req.CategoryID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("category not found")
		}
		return nil, err
	}

	if req.ISBN != "" {
		exists, err := s.bookRepo.ExistsByISBN(req.ISBN, nil)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, fmt.Errorf("ISBN already exists")
		}
	}

	book := &entities.Book{
		Title:               req.Title,
		Author:              req.Author,
		Publisher:           req.Publisher,
		YearPublished:       req.YearPublished,
		ISBN:                req.ISBN,
		CategoryID:          req.CategoryID,
		PhysicalStock:       req.PhysicalStock,
		IsPhysicalAvailable: req.IsPhysicalAvailable,
		IsDigitalAvailable:  req.IsDigitalAvailable,
		Status:              req.Status,
	}

	if book.Status == "" {
		book.Status = "ACTIVE"
	}

	if err := s.bookRepo.Create(book); err != nil {
		return nil, err
	}

	return s.bookRepo.FindByID(book.ID)
}

func (s *bookService) GetByID(ctx context.Context, id uint) (*entities.Book, error) {
	book, err := s.bookRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("book not found")
		}
		return nil, err
	}
	return book, nil
}

func (s *bookService) GetAll(ctx context.Context, page, limit int, search string, categoryID *uint) ([]entities.Book, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	return s.bookRepo.FindAll(page, limit, search, categoryID)
}

func (s *bookService) Update(ctx context.Context, id uint, req dto.BookRequest) (*entities.Book, error) {
	book, err := s.bookRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("book not found")
		}
		return nil, err
	}

	if _, err := s.categoryRepo.FindByID(req.CategoryID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("category not found")
		}
		return nil, err
	}

	if req.ISBN != "" && req.ISBN != book.ISBN {
		exists, err := s.bookRepo.ExistsByISBN(req.ISBN, &id)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, fmt.Errorf("ISBN already exists")
		}
	}

	book.Title = req.Title
	book.Author = req.Author
	book.Publisher = req.Publisher
	book.YearPublished = req.YearPublished
	book.ISBN = req.ISBN
	book.CategoryID = req.CategoryID
	book.PhysicalStock = req.PhysicalStock
	book.IsPhysicalAvailable = req.IsPhysicalAvailable
	book.IsDigitalAvailable = req.IsDigitalAvailable
	book.Status = req.Status

	if err := s.bookRepo.Update(book); err != nil {
		return nil, err
	}

	return s.bookRepo.FindByID(book.ID)
}

func (s *bookService) Delete(ctx context.Context, id uint) error {
	_, err := s.bookRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("book not found")
		}
		return err
	}
	return s.bookRepo.Delete(id)
}