package service

import (
	"context"
	"errors"
	"fmt"
	"math"
	"os"
	"strconv"
	"time"

	"github.com/literasiKu/database/entities"
	bookrepo "github.com/literasiKu/modules/book/repository"
	"github.com/literasiKu/modules/physical_loan/dto"
	"github.com/literasiKu/modules/physical_loan/repository"
	"gorm.io/gorm"
)

type PhysicalLoanService interface {
	Borrow(ctx context.Context, userID uint, req dto.CreateLoanRequest) (*dto.LoanResponse, error)
	Return(ctx context.Context, loanID uint, req dto.ReturnLoanRequest) (*dto.LoanResponse, error)
	GetAll(ctx context.Context, page, limit int, status string) ([]dto.LoanResponse, int64, error)
	GetByID(ctx context.Context, id uint) (*dto.LoanResponse, error)
	GetMyLoans(ctx context.Context, userID uint, page, limit int) ([]dto.LoanResponse, int64, error)
	PayFine(ctx context.Context, loanID uint) (*dto.LoanResponse, error)
}

type physicalLoanService struct {
	loanRepo repository.PhysicalLoanRepository
	bookRepo bookrepo.BookRepository
}

func NewPhysicalLoanService(loanRepo repository.PhysicalLoanRepository, bookRepo bookrepo.BookRepository) PhysicalLoanService {
	return &physicalLoanService{loanRepo: loanRepo, bookRepo: bookRepo}
}

func fineRatePerDay() float64 {
	if v := os.Getenv("FINE_RATE_PER_DAY"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			return f
		}
	}
	return 1000
}

func (s *physicalLoanService) Borrow(ctx context.Context, userID uint, req dto.CreateLoanRequest) (*dto.LoanResponse, error) {
	book, err := s.bookRepo.FindByID(req.BookID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("book not found")
		}
		return nil, err
	}

	if !book.IsPhysicalAvailable || book.PhysicalStock <= 0 {
		return nil, fmt.Errorf("book is not available for borrowing")
	}

	hasActive, err := s.loanRepo.HasActiveByUserID(userID)
	if err != nil {
		return nil, err
	}
	if hasActive {
		return nil, fmt.Errorf("you have an active loan that must be returned first")
	}

	dueDays := req.DueDays
	if dueDays <= 0 {
		dueDays = 7
	}

	now := time.Now()
	loan := &entities.PhysicalLoan{
		UserID:     userID,
		BookID:     req.BookID,
		BorrowDate: now,
		DueDate:    now.AddDate(0, 0, dueDays),
		Status:     "BORROWED",
		FineAmount: 0,
		FineStatus: "NONE",
	}

	if err := s.loanRepo.Create(loan); err != nil {
		return nil, err
	}

	// reduce stock
	book.PhysicalStock--
	if book.PhysicalStock == 0 {
		book.IsPhysicalAvailable = false
	}
	if err := s.bookRepo.Update(book); err != nil {
		return nil, err
	}

	full, err := s.loanRepo.FindByID(loan.ID)
	if err != nil {
		return nil, err
	}
	res := toLoanResponse(full)
	return &res, nil
}

func (s *physicalLoanService) Return(ctx context.Context, loanID uint, req dto.ReturnLoanRequest) (*dto.LoanResponse, error) {
	loan, err := s.loanRepo.FindByID(loanID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("loan not found")
		}
		return nil, err
	}

	if loan.Status == "RETURNED" {
		return nil, fmt.Errorf("loan already returned")
	}

	returnDate := time.Now()
	if req.ReturnDate != "" {
		parsed, err := time.Parse("2006-01-02", req.ReturnDate)
		if err != nil {
			return nil, fmt.Errorf("invalid return_date format, use YYYY-MM-DD")
		}
		returnDate = parsed
	}

	loan.ReturnDate = &returnDate
	loan.Status = "RETURNED"

	if returnDate.After(loan.DueDate) {
		overdueDays := math.Ceil(returnDate.Sub(loan.DueDate).Hours() / 24)
		loan.FineAmount = overdueDays * fineRatePerDay()
		loan.FineStatus = "UNPAID"
	}

	if err := s.loanRepo.Update(loan); err != nil {
		return nil, err
	}

	book, err := s.bookRepo.FindByID(loan.BookID)
	if err == nil {
		book.PhysicalStock++
		book.IsPhysicalAvailable = true
		_ = s.bookRepo.Update(book)
	}

	res := toLoanResponse(loan)
	return &res, nil
}

func (s *physicalLoanService) GetAll(ctx context.Context, page, limit int, status string) ([]dto.LoanResponse, int64, error) {
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

func (s *physicalLoanService) GetByID(ctx context.Context, id uint) (*dto.LoanResponse, error) {
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

func (s *physicalLoanService) GetMyLoans(ctx context.Context, userID uint, page, limit int) ([]dto.LoanResponse, int64, error) {
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

func (s *physicalLoanService) PayFine(ctx context.Context, loanID uint) (*dto.LoanResponse, error) {
	loan, err := s.loanRepo.FindByID(loanID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("loan not found")
		}
		return nil, err
	}
	if loan.FineStatus != "UNPAID" {
		return nil, fmt.Errorf("no unpaid fine for this loan")
	}
	loan.FineStatus = "PAID"
	if err := s.loanRepo.Update(loan); err != nil {
		return nil, err
	}
	res := toLoanResponse(loan)
	return &res, nil
}

func toLoanResponse(l *entities.PhysicalLoan) dto.LoanResponse {
	res := dto.LoanResponse{
		ID:         l.ID,
		UserID:     l.UserID,
		BookID:     l.BookID,
		BorrowDate: l.BorrowDate,
		DueDate:    l.DueDate,
		ReturnDate: l.ReturnDate,
		Status:     l.Status,
		FineAmount: l.FineAmount,
		FineStatus: l.FineStatus,
		CreatedAt:  l.CreatedAt,
	}
	if l.Book.ID != 0 {
		res.BookTitle = l.Book.Title
	}
	return res
}

func toLoanResponses(loans []entities.PhysicalLoan) []dto.LoanResponse {
	res := make([]dto.LoanResponse, len(loans))
	for i, l := range loans {
		res[i] = toLoanResponse(&l)
	}
	return res
}
