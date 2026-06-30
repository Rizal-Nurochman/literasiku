package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/literasiKu/database/entities"
	bookrepo "github.com/literasiKu/modules/book/repository"
	"github.com/literasiKu/modules/digital_loan/dto"
	"github.com/literasiKu/modules/digital_loan/repository"
	filerepo "github.com/literasiKu/modules/file/repository"
	"gorm.io/gorm"
)

type DigitalLoanService interface {
	Borrow(ctx context.Context, userID uint, req dto.CreateDigitalLoanRequest) (*dto.DigitalLoanResponse, error)
	Revoke(ctx context.Context, loanID uint) (*dto.DigitalLoanResponse, error)
	GetAll(ctx context.Context, page, limit int, status string) ([]dto.DigitalLoanResponse, int64, error)
	GetByID(ctx context.Context, id uint) (*dto.DigitalLoanResponse, error)
	GetMyLoans(ctx context.Context, userID uint, page, limit int) ([]dto.DigitalLoanResponse, int64, error)
	CheckAccess(ctx context.Context, userID, bookID uint) (bool, error)
}

type digitalLoanService struct {
	loanRepo repository.DigitalLoanRepository
	bookRepo bookrepo.BookRepository
	fileRepo filerepo.FileRepository
}

func NewDigitalLoanService(
	loanRepo repository.DigitalLoanRepository,
	bookRepo bookrepo.BookRepository,
	fileRepo filerepo.FileRepository,
) DigitalLoanService {
	return &digitalLoanService{loanRepo: loanRepo, bookRepo: bookRepo, fileRepo: fileRepo}
}

func (s *digitalLoanService) Borrow(ctx context.Context, userID uint, req dto.CreateDigitalLoanRequest) (*dto.DigitalLoanResponse, error) {
	book, err := s.bookRepo.FindByID(req.BookID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("book not found")
		}
		return nil, err
	}

	if !book.IsDigitalAvailable {
		return nil, fmt.Errorf("book is not available in digital format")
	}

	// check PDF exists
	files, err := s.fileRepo.FindByBookID(req.BookID)
	if err != nil || len(files) == 0 {
		return nil, fmt.Errorf("no PDF file found for this book")
	}

	// check already has active loan for this book
	hasActive, err := s.loanRepo.HasActiveByUserAndBook(userID, req.BookID)
	if err != nil {
		return nil, err
	}
	if hasActive {
		return nil, fmt.Errorf("you already have active access to this book")
	}

	dueDays := req.DueDays
	if dueDays <= 0 {
		dueDays = 7 // ponytail: default 7 days
	}

	now := time.Now()
	loan := &entities.DigitalLoan{
		UserID:       userID,
		BookID:       req.BookID,
		StartDate:    now,
		EndDate:      now.AddDate(0, 0, dueDays),
		AccessStatus: "ACTIVE",
	}

	if err := s.loanRepo.Create(loan); err != nil {
		return nil, err
	}

	full, err := s.loanRepo.FindByID(loan.ID)
	if err != nil {
		return nil, err
	}
	res := toLoanResponse(full)
	return &res, nil
}

func (s *digitalLoanService) Revoke(ctx context.Context, loanID uint) (*dto.DigitalLoanResponse, error) {
	loan, err := s.loanRepo.FindByID(loanID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("loan not found")
		}
		return nil, err
	}

	if loan.AccessStatus != "ACTIVE" {
		return nil, fmt.Errorf("loan is not active")
	}

	loan.AccessStatus = "REVOKED"
	if err := s.loanRepo.Update(loan); err != nil {
		return nil, err
	}

	res := toLoanResponse(loan)
	return &res, nil
}

func (s *digitalLoanService) GetAll(ctx context.Context, page, limit int, status string) ([]dto.DigitalLoanResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	loans, total, err := s.loanRepo.FindAll(page, limit, status)
	if err != nil {
		return nil, 0, err
	}
	return toLoanResponses(loans), total, nil
}

func (s *digitalLoanService) GetByID(ctx context.Context, id uint) (*dto.DigitalLoanResponse, error) {
	loan, err := s.loanRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("loan not found")
		}
		return nil, err
	}
	res := toLoanResponse(loan)
	return &res, nil
}

func (s *digitalLoanService) GetMyLoans(ctx context.Context, userID uint, page, limit int) ([]dto.DigitalLoanResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	loans, total, err := s.loanRepo.FindByUserID(userID, page, limit)
	if err != nil {
		return nil, 0, err
	}
	return toLoanResponses(loans), total, nil
}

func (s *digitalLoanService) CheckAccess(ctx context.Context, userID, bookID uint) (bool, error) {
	loan, err := s.loanRepo.FindActiveByUserAndBook(userID, bookID)
	if err != nil {
		return false, nil // not found = no access
	}
	if time.Now().After(loan.EndDate) {
		loan.AccessStatus = "EXPIRED"
		_ = s.loanRepo.Update(loan)
		return false, nil
	}
	return true, nil
}

func toLoanResponse(l *entities.DigitalLoan) dto.DigitalLoanResponse {
	res := dto.DigitalLoanResponse{
		ID:           l.ID,
		UserID:       l.UserID,
		BookID:       l.BookID,
		StartDate:    l.StartDate,
		EndDate:      l.EndDate,
		AccessStatus: l.AccessStatus,
		CreatedAt:    l.CreatedAt,
	}
	if l.User.ID != 0 {
		res.UserFullName = l.User.FullName
		res.Username = l.User.Username
	}
	if l.Book.ID != 0 {
		res.BookTitle = l.Book.Title
	}
	return res
}

func toLoanResponses(loans []entities.DigitalLoan) []dto.DigitalLoanResponse {
	res := make([]dto.DigitalLoanResponse, len(loans))
	for i, l := range loans {
		res[i] = toLoanResponse(&l)
	}
	return res
}
