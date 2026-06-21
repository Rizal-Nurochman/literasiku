package main

import (
	"log"

	"github.com/literasiKu/database"
	"github.com/literasiKu/database/config"
	"github.com/literasiKu/modules/auth/handler"
	authrepo "github.com/literasiKu/modules/auth/repository"
	authservice "github.com/literasiKu/modules/auth/service"
	"github.com/literasiKu/router"
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

	jwtService := authservice.NewJWTService()
	authRepo := authrepo.NewAuthRepository(config.GetDB())
	authSvc := authservice.NewAuthService(authRepo, jwtService)
	authHandler := handler.NewAuthHandler(authSvc)

	app := router.New(router.Deps{
		AuthHandler: authHandler,
		JWTService:  jwtService,
	})

	if err := app.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
