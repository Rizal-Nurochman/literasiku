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

type FileHandler interface {
	Create(ctx *gin.Context)
	GetByID(ctx *gin.Context)
	GetByBookID(ctx *gin.Context)
	Update(ctx *gin.Context)
	Delete(ctx *gin.Context)
}

type fileHandler struct {
	fileService service.FileService
}

func NewFileHandler(fileService service.FileService) FileHandler {
	return &fileHandler{fileService: fileService}
}

func (h *fileHandler) Create(ctx *gin.Context) {
	var req dto.FileRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed("Failed to parse request", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	file, err := h.fileService.Create(ctx.Request.Context(), req)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to create file", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("File created successfully", toFileResponse(file))
	ctx.JSON(http.StatusCreated, res)
}

func (h *fileHandler) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid file ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	file, err := h.fileService.GetByID(ctx.Request.Context(), uint(id))
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get file", err.Error(), nil)
		ctx.JSON(http.StatusNotFound, res)
		return
	}

	res := utils.BuildResponseSuccess("File retrieved successfully", toFileResponse(file))
	ctx.JSON(http.StatusOK, res)
}

func (h *fileHandler) GetByBookID(ctx *gin.Context) {
	bookID, err := strconv.ParseUint(ctx.Param("book_id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid book ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	files, err := h.fileService.GetByBookID(ctx.Request.Context(), uint(bookID))
	if err != nil {
		res := utils.BuildResponseFailed("Failed to get files", err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := utils.BuildResponseSuccess("Files retrieved successfully", toFileResponses(files))
	ctx.JSON(http.StatusOK, res)
}

func (h *fileHandler) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid file ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	var req dto.FileRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		res := utils.BuildResponseFailed("Failed to parse request", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	file, err := h.fileService.Update(ctx.Request.Context(), uint(id), req)
	if err != nil {
		res := utils.BuildResponseFailed("Failed to update file", err.Error(), nil)
		ctx.JSON(http.StatusBadRequest, res)
		return
	}

	res := utils.BuildResponseSuccess("File updated successfully", toFileResponse(file))
	ctx.JSON(http.StatusOK, res)
}

func (h *fileHandler) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		res := utils.BuildResponseFailed("Invalid file ID", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}

	if err := h.fileService.Delete(ctx.Request.Context(), uint(id)); err != nil {
		res := utils.BuildResponseFailed("Failed to delete file", err.Error(), nil)
		ctx.JSON(http.StatusInternalServerError, res)
		return
	}

	res := utils.BuildResponseSuccess("File deleted successfully", nil)
	ctx.JSON(http.StatusOK, res)
}

func toFileResponse(file *entities.File) dto.FileResponse {
	return dto.FileResponse{
		ID:         file.ID,
		BookID:     file.BookID,
		FilePath:   file.FilePath,
		FileName:   file.FileName,
		FileSize:   file.FileSize,
		UploadDate: file.UploadDate,
		Status:     file.Status,
		CreatedAt:  file.CreatedAt,
		UpdatedAt:  file.UpdatedAt,
	}
}

func toFileResponses(files []entities.File) []dto.FileResponse {
	responses := make([]dto.FileResponse, len(files))
	for i, file := range files {
		responses[i] = toFileResponse(&file)
	}
	return responses
}