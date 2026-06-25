package dto

import "time"

type BookRequest struct {
	Title           string `json:"title" binding:"required,min=1,max=255"`
	Author          string `json:"author" binding:"required,min=1,max=100"`
	Publisher       string `json:"publisher" binding:"max=100"`
	YearPublished   int    `json:"year_published" binding:"min=1000,max=2100"`
	ISBN            string `json:"isbn" binding:"max=20"`
	CategoryID      uint   `json:"category_id" binding:"required"`
	PhysicalStock   int    `json:"physical_stock" binding:"min=0"`
	IsPhysicalAvailable bool `json:"is_physical_available"`
	IsDigitalAvailable  bool `json:"is_digital_available"`
	Status          string `json:"status" binding:"oneof=ACTIVE INACTIVE DAMAGED LOST"`
}

type BookResponse struct {
	ID                uint               `json:"id"`
	Title             string             `json:"title"`
	Author            string             `json:"author"`
	Publisher         string             `json:"publisher"`
	YearPublished     int                `json:"year_published"`
	ISBN              string             `json:"isbn"`
	CategoryID        uint               `json:"category_id"`
	Category          *BookCategoryResponse `json:"category,omitempty"`
	PhysicalStock     int                `json:"physical_stock"`
	IsPhysicalAvailable bool             `json:"is_physical_available"`
	IsDigitalAvailable  bool             `json:"is_digital_available"`
	Status            string             `json:"status"`
	Files             []FileResponse     `json:"files,omitempty"`
	CreatedAt         time.Time          `json:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at"`
}

type BookCategoryRequest struct {
	Name string `json:"name" binding:"required,min=1,max=50"`
}

type BookCategoryResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

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

type PaginatedResponse struct {
	Data       any `json:"data"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int `json:"total_pages"`
}