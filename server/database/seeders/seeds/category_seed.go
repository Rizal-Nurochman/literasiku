package seeds

import (
	"encoding/json"
	"errors"
	"io"
	"os"

	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

func ListCategorySeeder(db *gorm.DB) error {
	jsonFile, err := os.Open("./database/seeders/json/categories.json")
	if err != nil {
		return err
	}
	defer jsonFile.Close()

	jsonData, err := io.ReadAll(jsonFile)
	if err != nil {
		return err
	}

	var list []entities.BookCategory
	if err := json.Unmarshal(jsonData, &list); err != nil {
		return err
	}

	for _, data := range list {
		var cat entities.BookCategory
		err := db.Where("name = ?", data.Name).First(&cat).Error
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := db.Create(&data).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
