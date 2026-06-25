package handler

import (
	"net/http"
	"strconv"

	"github.com/literasiKu/database/entities"
	"github.com/literasiKu/modules/category/dto"
	"github.com/literasiKu/modules/category/service"
	"github.com/literasiKu/pkg/utils"
	"github.com/gin-gonic/gin"
)

type CategoryHandler interface {
	Create(ctx *gin.Context)
	GetByID(ctx *gin.Context)
	GetAll(ctx *gin.Context)
	Update(ctx *gin.Context)
	Delete(ctx *gin.Context)
}

type categoryHandler struct {
	categoryService service.CategoryService
}

func NewCategoryHandler(categoryService service.CategoryService) CategoryHandler {
	return &categoryHandler{categoryService: categoryService}
}

func (h *categoryHandler) Create(ctx *gin.Context) {
	var req dto.CategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed("Failed to parse request", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	category, err := h.categoryService.Create(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to create category", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("Category created successfully", toCategoryResponse(category))
	ctx.JSON(http.StatusCreated, res)
}

func (h *categoryHandler) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid category ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	category, err := h.categoryService.GetByID(ctx.Request.Context(), uint(id))
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get category", err.Error(), nil)
		ctx.JSON(http.StatusNotFound, res)
		return
	}

	res := utils.BuildResponseSuccess("Category retrieved successfully", toCategoryResponse(category))
	ctx.JSON(http.StatusOK, res)
}

func (h *categoryHandler) GetAll(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	search := ctx.Query("search")

	categories, total, err := h.categoryService.GetAll(ctx.Request.Context(), page, limit, search)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get categories", err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	response := dto.PaginatedResponse{
		Data:       toCategoryResponses(categories),
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	res := utils.BuildResponseSuccess("Categories retrieved successfully", response)
	ctx.JSON(http.StatusOK, res)
}

func (h *categoryHandler) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid category ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	var req dto.CategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed("Failed to parse request", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	category, err := h.categoryService.Update(ctx.Request.Context(), uint(id), req)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to update category", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("Category updated successfully", toCategoryResponse(category))
	ctx.JSON(http.StatusOK, res)
}

func (h *categoryHandler) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid category ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	if err := h.categoryService.Delete(ctx.Request.Context(), uint(id)); err != nil {
		res := utils.BuildResponseFailed("Failed to delete category", err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := utils.BuildResponseSuccess("Category deleted successfully", nil)
	ctx.JSON(http.StatusOK, res)
}

func toCategoryResponse(category *entities.BookCategory) dto.CategoryResponse {
	return dto.CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		CreatedAt: category.CreatedAt,
		UpdatedAt: category.UpdatedAt,
	}
}

func toCategoryResponses(categories []entities.BookCategory) []dto.CategoryResponse {
	responses := make([]dto.CategoryResponse, len(categories))
	for i, category := range categories {
		responses[i] = toCategoryResponse(&category)
	}
	return responses
}