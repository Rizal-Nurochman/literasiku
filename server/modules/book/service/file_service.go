package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/literasiKu/database/entities"
	"github.com/literasiKu/modules/book/dto"
	"github.com/literasiKu/modules/book/repository"
	"gorm.io/gorm"
)

type FileService interface {
	Create(ctx context.Context, req dto.FileRequest) (*entities.File, error)
	GetByID(ctx context.Context, id uint) (*entities.File, error)
	GetByBookID(ctx context.Context, bookID uint) ([]entities.File, error)
	Update(ctx context.Context, id uint, req dto.FileRequest) (*entities.File, error)
	Delete(ctx context.Context, id uint) error
}

type fileService struct {
	fileRepo repository.FileRepository
	bookRepo repository.BookRepository
}

func NewFileService(fileRepo repository.FileRepository, bookRepo repository.BookRepository) FileService {
	return &fileService{
		fileRepo: fileRepo,
		bookRepo: bookRepo,
	}
}

func (s *fileService) Create(ctx context.Context, req dto.FileRequest) (*entities.File, error) {
	if _, err := s.bookRepo.FindByID(req.BookID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("book not found")
		}
		return nil, err
	}

	uploadDate, err := time.Parse("2006-01-02", req.UploadDate)
	if err != nil {
		return nil, fmt.Errorf("invalid upload_date format, use YYYY-MM-DD")
	}

	file := &entities.File{
		BookID:     req.BookID,
		FilePath:   req.FilePath,
		FileName:   req.FileName,
		FileSize:   req.FileSize,
		UploadDate: uploadDate,
		Status:     req.Status,
	}

	if file.Status == "" {
		file.Status = "ACTIVE"
	}

	if err := s.fileRepo.Create(file); err != nil {
		return nil, err
	}

	return s.fileRepo.FindByID(file.ID)
}

func (s *fileService) GetByID(ctx context.Context, id uint) (*entities.File, error) {
	file, err := s.fileRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("file not found")
		}
		return nil, err
	}
	return file, nil
}

func (s *fileService) GetByBookID(ctx context.Context, bookID uint) ([]entities.File, error) {
	if _, err := s.bookRepo.FindByID(bookID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("book not found")
		}
		return nil, err
	}
	return s.fileRepo.FindByBookID(bookID)
}

func (s *fileService) Update(ctx context.Context, id uint, req dto.FileRequest) (*entities.File, error) {
	file, err := s.fileRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("file not found")
		}
		return nil, err
	}

	if req.BookID != 0 && req.BookID != file.BookID {
		if _, err := s.bookRepo.FindByID(req.BookID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("book not found")
			}
			return nil, err
		}
		file.BookID = req.BookID
	}

	if req.FilePath != "" {
		file.FilePath = req.FilePath
	}
	if req.FileName != "" {
		file.FileName = req.FileName
	}
	if req.FileSize > 0 {
		file.FileSize = req.FileSize
	}
	if req.UploadDate != "" {
		uploadDate, err := time.Parse("2006-01-02", req.UploadDate)
		if err != nil {
			return nil, fmt.Errorf("invalid upload_date format, use YYYY-MM-DD")
		}
		file.UploadDate = uploadDate
	}
	if req.Status != "" {
		file.Status = req.Status
	}

	if err := s.fileRepo.Update(file); err != nil {
		return nil, err
	}

	return s.fileRepo.FindByID(file.ID)
}

func (s *fileService) Delete(ctx context.Context, id uint) error {
	_, err := s.fileRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("file not found")
		}
		return err
	}
	return s.fileRepo.Delete(id)
}