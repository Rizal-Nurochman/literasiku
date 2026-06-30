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
	Status          string `json:"status" binding:"omitempty,oneof=ACTIVE INACTIVE DAMAGED LOST"`
	FileURL         string `json:"file_url" binding:"omitempty,max=500"`
}

type BookResponse struct {
	ID                uint      `json:"id"`
	Title             string    `json:"title"`
	Author            string    `json:"author"`
	Publisher         string    `json:"publisher"`
	YearPublished     int       `json:"year_published"`
	ISBN              string    `json:"isbn"`
	CategoryID        uint      `json:"category_id"`
	PhysicalStock     int       `json:"physical_stock"`
	IsPhysicalAvailable bool     `json:"is_physical_available"`
	IsDigitalAvailable  bool     `json:"is_digital_available"`
	Status            string    `json:"status"`
	FileURL           string    `json:"file_url"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type PaginatedResponse struct {
	Data       any `json:"data"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int `json:"total_pages"`
}