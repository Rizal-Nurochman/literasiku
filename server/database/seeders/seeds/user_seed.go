package seeds

import (
	"encoding/json"
	"errors"
	"io"
	"os"

	"github.com/literasiKu/database/entities"
	"github.com/literasiKu/pkg/helpers"
	"gorm.io/gorm"
)

type userJSON struct {
	Role             string `json:"role"`
	Username         string `json:"username"`
	FullName         string `json:"full_name"`
	Email            string `json:"email"`
	Password         string `json:"password"`
	MembershipNumber string `json:"membership_number"`
	PhoneNumber      string `json:"phone_number"`
	Status           string `json:"status"`
}

func ListUserSeeder(db *gorm.DB) error {
	jsonFile, err := os.Open("./database/seeders/json/users.json")
	if err != nil {
		return err
	}
	defer jsonFile.Close()

	jsonData, err := io.ReadAll(jsonFile)
	if err != nil {
		return err
	}

	var list []userJSON
	if err := json.Unmarshal(jsonData, &list); err != nil {
		return err
	}

	for _, data := range list {
		var user entities.User
		err := db.Where("email = ?", data.Email).First(&user).Error
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			hash, err := helpers.HashPassword(data.Password)
			if err != nil {
				return err
			}
			user = entities.User{
				Role:             data.Role,
				Username:         data.Username,
				FullName:         data.FullName,
				Email:            data.Email,
				PasswordHash:     hash,
				MembershipNumber: data.MembershipNumber,
				PhoneNumber:      data.PhoneNumber,
				Status:           data.Status,
			}
			if err := db.Create(&user).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
