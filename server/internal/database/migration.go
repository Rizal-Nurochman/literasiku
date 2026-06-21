package database

import (
	"fmt"

	"github.com/literasiKu/internal/model"
)

func AutoMigrate() error {
	if DB == nil {
		return fmt.Errorf("database connection is not initialized")
	}

	if err := DB.AutoMigrate(
		&model.User{},
		&model.KategoriBuku{},
		&model.Buku{},
		&model.FilePDF{},
		&model.PeminjamanFisik{},
		&model.PeminjamanDigital{},
		&model.RiwayatChatbot{},
	); err != nil {
		return fmt.Errorf("auto migrate models: %w", err)
	}

	return nil
}
