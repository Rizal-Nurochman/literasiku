package seeds

import (
	"encoding/json"
	"errors"
	"io"
	"os"

	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

type bookJSON struct {
	Title               string `json:"title"`
	Author              string `json:"author"`
	Publisher           string `json:"publisher"`
	YearPublished       int    `json:"year_published"`
	ISBN                string `json:"isbn"`
	PhysicalStock       int    `json:"physical_stock"`
	IsPhysicalAvailable bool   `json:"is_physical_available"`
	IsDigitalAvailable  bool   `json:"is_digital_available"`
	Status              string `json:"status"`
	CategoryName        string `json:"category_name"`
}

func ListBookSeeder(db *gorm.DB) error {
	jsonFile, err := os.Open("./database/seeders/json/books.json")
	if err != nil {
		return err
	}
	defer jsonFile.Close()

	jsonData, err := io.ReadAll(jsonFile)
	if err != nil {
		return err
	}

	var list []bookJSON
	if err := json.Unmarshal(jsonData, &list); err != nil {
		return err
	}

	for _, data := range list {
		var book entities.Book
		err := db.Where("isbn = ?", data.ISBN).First(&book).Error
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			var cat entities.BookCategory
			if err := db.Where("name = ?", data.CategoryName).First(&cat).Error; err != nil {
				return err
			}
			book = entities.Book{
				CategoryID:          cat.ID,
				Title:               data.Title,
				Author:              data.Author,
				Publisher:           data.Publisher,
				YearPublished:       data.YearPublished,
				ISBN:                data.ISBN,
				PhysicalStock:       data.PhysicalStock,
				IsPhysicalAvailable: data.IsPhysicalAvailable,
				IsDigitalAvailable:  data.IsDigitalAvailable,
				Status:              data.Status,
			}
			if err := db.Create(&book).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
