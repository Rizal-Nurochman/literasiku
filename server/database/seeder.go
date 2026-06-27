package database

import (
	"github.com/literasiKu/database/seeders/seeds"
	"gorm.io/gorm"
)

func Seeder(db *gorm.DB) error {
	if err := seeds.ListCategorySeeder(db); err != nil {
		return err
	}

	if err := seeds.ListUserSeeder(db); err != nil {
		return err
	}

	if err := seeds.ListBookSeeder(db); err != nil {
		return err
	}

	if err := seeds.ListFileSeeder(db); err != nil {
		return err
	}

	return nil
}
