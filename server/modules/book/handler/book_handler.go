package handler

import (
	"net/http"
	"strconv"

	"github.com/literasiKu/database/entities"
	"github.com/literasiKu/modules/book/dto"
	"github.com/literasiKu/modules/book/service"
	"github.com/literasiKu/pkg/utils"
	"github.com/gin-gonic/gin"
)

type BookHandler interface {
	Create(ctx *gin.Context)
	GetByID(ctx *gin.Context)
	GetAll(ctx *gin.Context)
	Update(ctx *gin.Context)
	Delete(ctx *gin.Context)
}

type bookHandler struct {
	bookService service.BookService
}

func NewBookHandler(bookService service.BookService) BookHandler {
	return &bookHandler{bookService: bookService}
}

func (h *bookHandler) Create(ctx *gin.Context) {
	var req dto.BookRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed("Failed to parse request", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	book, err := h.bookService.Create(ctx.Request.Context(), req)
	if err != nil {
		status := http.StatusBadRequest
		res := utils.BuildResponseFailed("Failed to create book", err.Error(), nil)
		ctx.JSON(status, res)
		return
	}

	res := utils.BuildResponseSuccess("Book created successfully", toBookResponse(book))
	ctx.JSON(http.StatusCreated, res)
}

func (h *bookHandler) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid book ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	book, err := h.bookService.GetByID(ctx.Request.Context(), uint(id))
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get book", err.Error(), nil)
		ctx.JSON(http.StatusNotFound, res)
		return
	}

	res := utils.BuildResponseSuccess("Book retrieved successfully", toBookResponse(book))
	ctx.JSON(http.StatusOK, res)
}

func (h *bookHandler) GetAll(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	search := ctx.Query("search")
	categoryIDStr := ctx.Query("category_id")

	var categoryID *uint
	if categoryIDStr != "" {
		if id, err := strconv.ParseUint(categoryIDStr, 10, 32); err == nil {
			u := uint(id)
			categoryID = &u
		}
	}

	books, total, err := h.bookService.GetAll(ctx.Request.Context(), page, limit, search, categoryID)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get books", err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	response := dto.PaginatedResponse{
		Data:       toBookResponses(books),
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	res := utils.BuildResponseSuccess("Books retrieved successfully", response)
	ctx.JSON(http.StatusOK, res)
}

func (h *bookHandler) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid book ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	var req dto.BookRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed("Failed to parse request", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	book, err := h.bookService.Update(ctx.Request.Context(), uint(id), req)
	if err != nil {
		status := http.StatusBadRequest
		res := utils.BuildResponseFailed("Failed to update book", err.Error(), nil)
		ctx.JSON(status, res)
		return
	}

	res := utils.BuildResponseSuccess("Book updated successfully", toBookResponse(book))
	ctx.JSON(http.StatusOK, res)
}

func (h *bookHandler) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid book ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	if err := h.bookService.Delete(ctx.Request.Context(), uint(id)); err != nil {
		res := utils.BuildResponseFailed("Failed to delete book", err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := utils.BuildResponseSuccess("Book deleted successfully", nil)
	ctx.JSON(http.StatusOK, res)
}

func toBookResponse(book *entities.Book) dto.BookResponse {
	var category *dto.BookCategoryResponse
	if book.Category.ID != 0 {
		category = &dto.BookCategoryResponse{
			ID:        book.Category.ID,
			Name:      book.Category.Name,
			CreatedAt: book.Category.CreatedAt,
			UpdatedAt: book.Category.UpdatedAt,
		}
	}

	files := make([]dto.FileResponse, len(book.Files))
	for i, f := range book.Files {
		files[i] = dto.FileResponse{
			ID:         f.ID,
			BookID:     f.BookID,
			FilePath:   f.FilePath,
			FileName:   f.FileName,
			FileSize:   f.FileSize,
			UploadDate: f.UploadDate,
			Status:     f.Status,
			CreatedAt:  f.CreatedAt,
			UpdatedAt:  f.UpdatedAt,
		}
	}

	return dto.BookResponse{
		ID:                book.ID,
		Title:             book.Title,
		Author:            book.Author,
		Publisher:         book.Publisher,
		YearPublished:     book.YearPublished,
		ISBN:              book.ISBN,
		CategoryID:        book.CategoryID,
		Category:          category,
		PhysicalStock:     book.PhysicalStock,
		IsPhysicalAvailable: book.IsPhysicalAvailable,
		IsDigitalAvailable:  book.IsDigitalAvailable,
		Status:            book.Status,
		Files:             files,
		CreatedAt:         book.CreatedAt,
		UpdatedAt:         book.UpdatedAt,
	}
}

func toBookResponses(books []entities.Book) []dto.BookResponse {
	responses := make([]dto.BookResponse, len(books))
	for i, book := range books {
		responses[i] = toBookResponse(&book)
	}
	return responses
}