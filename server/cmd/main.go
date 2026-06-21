package main

import (
	"log"

	"github.com/literasiKu/database"
	"github.com/literasiKu/database/config"
	"github.com/literasiKu/router"
)

func main() {
	cfg := config.LoadConfig()

	if err := config.Connect(cfg); err != nil {
		log.Fatalf("failed to cconfig: %v", err)
	}
	defer func() {
		if err := config.Close(); err != nil {
			log.Printf("failed to close database: %v", err)
		}
	}()

	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	app := router.New()

	if err := app.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
