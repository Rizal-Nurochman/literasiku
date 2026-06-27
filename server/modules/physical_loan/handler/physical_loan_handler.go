package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/literasiKu/modules/physical_loan/dto"
	"github.com/literasiKu/modules/physical_loan/service"
	"github.com/literasiKu/pkg/utils"
)

type PhysicalLoanHandler interface {
	Borrow(ctx *gin.Context)
	Return(ctx *gin.Context)
	GetAll(ctx *gin.Context)
	GetByID(ctx *gin.Context)
	GetMyLoans(ctx *gin.Context)
	PayFine(ctx *gin.Context)
}

type physicalLoanHandler struct {
	svc service.PhysicalLoanService
}

func NewPhysicalLoanHandler(svc service.PhysicalLoanService) PhysicalLoanHandler {
	return &physicalLoanHandler{svc: svc}
}

func (h *physicalLoanHandler) Borrow(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	var req dto.CreateLoanRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, utils.BuildResponseFailed("Failed to parse request", err.Error(), nil))
		return
	}

	loan, err := h.svc.Borrow(ctx.Request.Context(), userID, req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.BuildResponseFailed("Failed to borrow book", err.Error(), nil))
		return
	}

	ctx.JSON(http.StatusCreated, utils.BuildResponseSuccess("Book borrowed successfully", loan))
}

func (h *physicalLoanHandler) Return(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, utils.BuildResponseFailed("Invalid loan ID", err.Error(), nil))
		return
	}

	var req dto.ReturnLoanRequest
	_ = ctx.ShouldBindJSON(&req) // optional body

	loan, err := h.svc.Return(ctx.Request.Context(), uint(id), req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.BuildResponseFailed("Failed to return book", err.Error(), nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.BuildResponseSuccess("Book returned successfully", loan))
}

func (h *physicalLoanHandler) GetAll(ctx *gin.Context) {
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

func (h *physicalLoanHandler) GetByID(ctx *gin.Context) {
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

func (h *physicalLoanHandler) GetMyLoans(ctx *gin.Context) {
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

func (h *physicalLoanHandler) PayFine(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, utils.BuildResponseFailed("Invalid loan ID", err.Error(), nil))
		return
	}

	loan, err := h.svc.PayFine(ctx.Request.Context(), uint(id))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.BuildResponseFailed("Failed to pay fine", err.Error(), nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.BuildResponseSuccess("Fine paid successfully", loan))
}
