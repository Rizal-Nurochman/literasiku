package dto

import "time"

type FileRequest struct {
	BookID     uint   `json:"book_id" binding:"required"`
	FilePath   string `json:"file_path" binding:"required,max=500"`
	FileName   string `json:"file_name" binding:"required,max=255"`
	FileSize   int64  `json:"file_size" binding:"min=0"`
	UploadDate string `json:"upload_date" binding:"required"`
	Status     string `json:"status" binding:"oneof=ACTIVE INACTIVE"`
}

type FileResponse struct {
	ID         uint      `json:"id"`
	BookID     uint      `json:"book_id"`
	FilePath   string    `json:"file_path"`
	FileName   string    `json:"file_name"`
	FileSize   int64     `json:"file_size"`
	UploadDate time.Time `json:"upload_date"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}