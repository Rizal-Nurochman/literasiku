package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/literasiKu/modules/user/service"
	"github.com/literasiKu/modules/user/dto"
	"github.com/literasiKu/pkg/utils"
)

type UserHandler interface {
	GetAll(ctx *gin.Context)
	GetByID(ctx *gin.Context)
	Update(ctx *gin.Context)
	Delete(ctx *gin.Context)
	Me(ctx *gin.Context)
	UpdateMe(ctx *gin.Context)
}

type userHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) UserHandler {
	return &userHandler{userService: userService}
}

func (h *userHandler) GetAll(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	search := ctx.Query("search")
	role := ctx.Query("role")

	users, total, err := h.userService.GetAll(ctx.Request.Context(), page, limit, search, role)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get users", err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	res := utils.BuildResponseSuccess("Users retrieved successfully", dto.PaginatedResponse{
		Data:       users,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	})
	ctx.JSON(http.StatusOK, res)
}

func (h *userHandler) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid user ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	user, err := h.userService.GetByID(ctx.Request.Context(), uint(id))
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get user", err.Error(), nil)
		ctx.JSON(http.StatusNotFound, res)
		return
	}

	res := utils.BuildResponseSuccess("User retrieved successfully", user)
	ctx.JSON(http.StatusOK, res)
}

func (h *userHandler) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid user ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	var req dto.UpdateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed("Failed to parse request", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	user, err := h.userService.Update(ctx.Request.Context(), uint(id), req)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to update user", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("User updated successfully", user)
	ctx.JSON(http.StatusOK, res)
}

func (h *userHandler) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid user ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	if err := h.userService.Delete(ctx.Request.Context(), uint(id)); err != nil {
		res := utils.BuildResponseFailed("Failed to delete user", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("User deleted successfully", nil)
	ctx.JSON(http.StatusOK, res)
}

func (h *userHandler) Me(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	user, err := h.userService.GetByID(ctx.Request.Context(), userID)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get profile", err.Error(), nil)
		ctx.JSON(http.StatusNotFound, res)
		return
	}

	res := utils.BuildResponseSuccess("Profile retrieved successfully", user)
	ctx.JSON(http.StatusOK, res)
}

func (h *userHandler) UpdateMe(ctx *gin.Context) {
	userID := ctx.GetUint("user_id")

	var req dto.UpdateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed("Failed to parse request", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}
	
	req.Status = ""

	user, err := h.userService.Update(ctx.Request.Context(), userID, req)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to update profile", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("Profile updated successfully", user)
	ctx.JSON(http.StatusOK, res)
}
