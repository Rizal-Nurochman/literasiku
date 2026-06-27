package seeds

import (
	"encoding/json"
	"errors"
	"io"
	"os"
	"time"

	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

type fileJSON struct {
	BookISBN string `json:"book_isbn"`
	FileName string `json:"file_name"`
	FilePath string `json:"file_path"`
	FileSize int64  `json:"file_size"`
	Status   string `json:"status"`
}

func ListFileSeeder(db *gorm.DB) error {
	jsonFile, err := os.Open("./database/seeders/json/files.json")
	if err != nil {
		return err
	}
	defer jsonFile.Close()

	jsonData, err := io.ReadAll(jsonFile)
	if err != nil {
		return err
	}

	var list []fileJSON
	if err := json.Unmarshal(jsonData, &list); err != nil {
		return err
	}

	for _, data := range list {
		var book entities.Book
		if err := db.Where("isbn = ?", data.BookISBN).First(&book).Error; err != nil {
			return err
		}

		var file entities.File
		err := db.Where("book_id = ? AND file_name = ?", book.ID, data.FileName).First(&file).Error
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			file = entities.File{
				BookID:     book.ID,
				FileName:   data.FileName,
				FilePath:   data.FilePath,
				FileSize:   data.FileSize,
				UploadDate: time.Now(),
				Status:     data.Status,
			}
			if err := db.Create(&file).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
