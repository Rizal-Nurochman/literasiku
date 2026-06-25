package handler

import (
	"errors"
	"net/http"

	"github.com/literasiKu/modules/auth/dto"
	"github.com/literasiKu/modules/auth/service"
	"github.com/literasiKu/pkg/utils"
	"github.com/gin-gonic/gin"
)

type (
	AuthHandler interface {
		Register(ctx *gin.Context)
		Login(ctx *gin.Context)
		Logout(ctx *gin.Context)
	}

	authHandler struct {
		authService service.AuthService
	}
)

func NewAuthHandler(authService service.AuthService) AuthHandler {
	return &authHandler{authService: authService}
}

func (h *authHandler) Register(ctx *gin.Context) {
	var req dto.RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := h.authService.Register(ctx.Request.Context(), req)
	if err != nil {
		status := http.StatusBadRequest
		switch {
		case errors.Is(err, dto.ErrEmailAlreadyExists):
			status = http.StatusConflict
		}
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_REGISTER_USER, err.Error(), nil)
		ctx.JSON(status, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_REGISTER_USER, result)
	ctx.JSON(http.StatusOK, res)
}

func (h *authHandler) Login(ctx *gin.Context) {
	var req dto.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_GET_DATA_FROM_BODY, err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	result, err := h.authService.Login(ctx.Request.Context(), req)
	if err != nil {
		status := http.StatusUnauthorized
		switch {
		case errors.Is(err, dto.ErrInvalidCredentials):
			status = http.StatusUnauthorized
		case errors.Is(err, dto.ErrUserBlocked), errors.Is(err, dto.ErrUserInactive):
			status = http.StatusForbidden
		}
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_LOGIN, err.Error(), nil)
		ctx.JSON(status, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_LOGIN, result)
	ctx.JSON(http.StatusOK, res)
}

func (h *authHandler) Logout(ctx *gin.Context) {
	userID, ok := ctx.Get("user_id")
	if !ok {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_LOGOUT, dto.MESSAGE_FAILED_TOKEN_NOT_VALID, nil)
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, res)
		return
	}
	id, ok := userID.(uint)
	if !ok {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_LOGOUT, dto.MESSAGE_FAILED_TOKEN_NOT_VALID, nil)
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, res)
		return
	}

	if err := h.authService.Logout(ctx.Request.Context(), id); err != nil {
		res := utils.BuildResponseFailed(dto.MESSAGE_FAILED_LOGOUT, err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess(dto.MESSAGE_SUCCESS_LOGOUT, nil)
	ctx.JSON(http.StatusOK, res)
}
