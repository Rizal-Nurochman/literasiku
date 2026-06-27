package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/literasiKu/modules/digital_loan/dto"
	"github.com/literasiKu/modules/digital_loan/service"
	"github.com/literasiKu/pkg/utils"
)

type DigitalLoanHandler interface {
	Borrow(ctx *gin.Context)
	Revoke(ctx *gin.Context)
	GetAll(ctx *gin.Context)
	GetByID(ctx *gin.Context)
	GetMyLoans(ctx *gin.Context)
	CheckAccess(ctx *gin.Context)
}

type digitalLoanHandler struct {
	svc service.DigitalLoanService
}

func NewDigitalLoanHandler(svc service.DigitalLoanService) DigitalLoanHandler {
	return &digitalLoanHandler{svc: svc}
}

func (h *digitalLoanHandler) Borrow(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	var req dto.CreateDigitalLoanRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, utils.BuildResponseFailed("Failed to parse request", err.Error(), nil))
		return
	}

	loan, err := h.svc.Borrow(ctx.Request.Context(), userID, req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.BuildResponseFailed("Failed to borrow digital book", err.Error(), nil))
		return
	}

	ctx.JSON(http.StatusCreated, utils.BuildResponseSuccess("Digital book borrowed successfully", loan))
}

func (h *digitalLoanHandler) Revoke(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, utils.BuildResponseFailed("Invalid loan ID", err.Error(), nil))
		return
	}

	loan, err := h.svc.Revoke(ctx.Request.Context(), uint(id))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.BuildResponseFailed("Failed to revoke access", err.Error(), nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.BuildResponseSuccess("Access revoked successfully", loan))
}

func (h *digitalLoanHandler) GetAll(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	status := ctx.Query("status")

	loans, total, err := h.svc.GetAll(ctx.Request.Context(), page, limit, status)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.BuildResponseFailed("Failed to get loans", err.Error(), nil))
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	ctx.JSON(http.StatusOK, utils.BuildResponseSuccess("Loans retrieved successfully", dto.PaginatedResponse{
		Data: loans, Page: page, Limit: limit, Total: total, TotalPages: totalPages,
	}))
}

func (h *digitalLoanHandler) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, utils.BuildResponseFailed("Invalid loan ID", err.Error(), nil))
		return
	}

	loan, err := h.svc.GetByID(ctx.Request.Context(), uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, utils.BuildResponseFailed("Loan not found", err.Error(), nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.BuildResponseSuccess("Loan retrieved successfully", loan))
}

func (h *digitalLoanHandler) GetMyLoans(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	loans, total, err := h.svc.GetMyLoans(ctx.Request.Context(), userID, page, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.BuildResponseFailed("Failed to get loans", err.Error(), nil))
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	ctx.JSON(http.StatusOK, utils.BuildResponseSuccess("Loans retrieved successfully", dto.PaginatedResponse{
		Data: loans, Page: page, Limit: limit, Total: total, TotalPages: totalPages,
	}))
}

func (h *digitalLoanHandler) CheckAccess(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")
	bookIDStr := ctx.Param("book_id")

	bookID, err := strconv.ParseUint(bookIDStr, 10, 32)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, utils.BuildResponseFailed("Invalid book ID", err.Error(), nil))
		return
	}

	hasAccess, err := h.svc.CheckAccess(ctx.Request.Context(), userID, uint(bookID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.BuildResponseFailed("Failed to check access", err.Error(), nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.BuildResponseSuccess("Access checked successfully", gin.H{"has_access": hasAccess}))
}
