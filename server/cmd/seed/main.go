package main

import (
	"log"

	"github.com/literasiKu/database"
	"github.com/literasiKu/database/config"
)

func main() {
	cfg := config.LoadConfig()

	if err := config.Connect(cfg); err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	defer func() {
		if err := config.Close(); err != nil {
			log.Printf("failed to close database: %v", err)
		}
	}()

	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	db := config.GetDB()

	if err := database.Seeder(db); err != nil {
		log.Fatalf("failed to seed database: %v", err)
	}

	log.Println("seeding completed successfully")
}
