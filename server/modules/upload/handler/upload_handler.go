package handler

import (
	"context"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/imagekit-developer/imagekit-go/v2"
	"github.com/imagekit-developer/imagekit-go/v2/option"
	"github.com/imagekit-developer/imagekit-go/v2/packages/param"
	"github.com/literasiKu/pkg/utils"
)

type UploadHandler interface {
	Upload(ctx *gin.Context)
}

type uploadHandler struct{}

func NewUploadHandler() UploadHandler {
	return &uploadHandler{}
}

func (h *uploadHandler) Upload(ctx *gin.Context) {
	file, header, err := ctx.Request.FormFile("file")
	if err != nil {
		res := utils.BuildResponseFailed("Failed to read file", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusBadRequest, res)
		return
	}
	defer file.Close()

	folder := ctx.DefaultPostForm("folder", "/literasiku/books")

	privateKey := os.Getenv("IMAGEKIT_PRIVATE_KEY")
	if privateKey == "" {
		res := utils.BuildResponseFailed("ImageKit not configured", "IMAGEKIT_PRIVATE_KEY is missing", nil)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, res)
		return
	}

	client := imagekit.NewClient(
		option.WithPrivateKey(privateKey),
	)

	resp, err := client.Files.Upload(context.Background(), imagekit.FileUploadParams{
		File:     file,
		FileName: header.Filename,
		Folder:   param.NewOpt(folder),
	})

	if err != nil {
		res := utils.BuildResponseFailed("Failed to upload file to ImageKit", err.Error(), nil)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, res)
		return
	}

	res := utils.BuildResponseSuccess("File uploaded successfully", gin.H{
		"url":       resp.URL,
		"file_id":   resp.FileID,
		"name":      resp.Name,
		"file_type": resp.FileType,
		"size":      resp.Size,
	})
	ctx.JSON(http.StatusCreated, res)
}
