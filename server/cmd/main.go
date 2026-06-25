package main

import (
	"log"

	"github.com/literasiKu/database"
	"github.com/literasiKu/database/config"
	"github.com/literasiKu/modules/auth/handler"
	authrepo "github.com/literasiKu/modules/auth/repository"
	authservice "github.com/literasiKu/modules/auth/service"
	bookrepo "github.com/literasiKu/modules/book/repository"
	bookservice "github.com/literasiKu/modules/book/service"
	bookhandler "github.com/literasiKu/modules/book/handler"
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

	db := config.GetDB()

	jwtService := authservice.NewJWTService()
	authRepo := authrepo.NewAuthRepository(db)
	authSvc := authservice.NewAuthService(authRepo, jwtService)
	authHandler := handler.NewAuthHandler(authSvc)

	bookRepo := bookrepo.NewBookRepository(db)
	categoryRepo := bookrepo.NewBookCategoryRepository(db)
	fileRepo := bookrepo.NewFileRepository(db)

	bookSvc := bookservice.NewBookService(bookRepo, categoryRepo)
	categorySvc := bookservice.NewBookCategoryService(categoryRepo)
	fileSvc := bookservice.NewFileService(fileRepo, bookRepo)

	bookHandler := bookhandler.NewBookHandler(bookSvc)
	categoryHandler := bookhandler.NewBookCategoryHandler(categorySvc)
	fileHandler := bookhandler.NewFileHandler(fileSvc)

	app := router.New(router.Deps{
		AuthHandler:     authHandler,
		BookHandler:     bookHandler,
		CategoryHandler: categoryHandler,
		FileHandler:     fileHandler,
		JWTService:      jwtService,
	})

	if err := app.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}