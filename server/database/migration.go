package database

import (
	"fmt"

	"github.com/literasiKu/database/entities"
	"gorm.io/gorm"
)

var DB *gorm.DB

func AutoMigrate() error {
	if DB == nil {
		return fmt.Errorf("database connection is not initialized")
	}

	if err := DB.AutoMigrate(
		&entities.User{},
		&entities.KategoriBuku{},
		&entities.Buku{},
		&entities.FilePDF{},
		&entities.PeminjamanFisik{},
		&entities.PeminjamanDigital{},
		&entities.RiwayatChatbot{},
	); err != nil {
		return fmt.Errorf("Auto migrate models: %w", err)
	}

	return nil
}