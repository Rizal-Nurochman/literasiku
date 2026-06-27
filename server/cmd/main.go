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
	categoryrepo "github.com/literasiKu/modules/category/repository"
	categoryservice "github.com/literasiKu/modules/category/service"
	categoryhandler "github.com/literasiKu/modules/category/handler"
	filerepo "github.com/literasiKu/modules/file/repository"
	fileservice "github.com/literasiKu/modules/file/service"
	filehandler "github.com/literasiKu/modules/file/handler"
	userrepo "github.com/literasiKu/modules/user/repository"
	userservice "github.com/literasiKu/modules/user/service"
	userhandler "github.com/literasiKu/modules/user/handler"
	physicalloanrepo "github.com/literasiKu/modules/physical_loan/repository"
	physicalloanservice "github.com/literasiKu/modules/physical_loan/service"
	physicalloanhandler "github.com/literasiKu/modules/physical_loan/handler"
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
	categoryRepo := categoryrepo.NewCategoryRepository(db)
	fileRepo := filerepo.NewFileRepository(db)
	userRepo := userrepo.NewUserRepository(db)
	physicalLoanRepo := physicalloanrepo.NewPhysicalLoanRepository(db)

	bookSvc := bookservice.NewBookService(bookRepo, categoryRepo)
	categorySvc := categoryservice.NewCategoryService(categoryRepo)
	fileSvc := fileservice.NewFileService(fileRepo, bookRepo)
	userSvc := userservice.NewUserService(userRepo)
	physicalLoanSvc := physicalloanservice.NewPhysicalLoanService(physicalLoanRepo, bookRepo)

	bookHandler := bookhandler.NewBookHandler(bookSvc)
	categoryHandler := categoryhandler.NewCategoryHandler(categorySvc)
	fileHandler := filehandler.NewFileHandler(fileSvc)
	userHandler := userhandler.NewUserHandler(userSvc)
	physicalLoanHandler := physicalloanhandler.NewPhysicalLoanHandler(physicalLoanSvc)

	app := router.New(router.Deps{
		AuthHandler:         authHandler,
		BookHandler:         bookHandler,
		CategoryHandler:     categoryHandler,
		FileHandler:         fileHandler,
		UserHandler:         userHandler,
		PhysicalLoanHandler: physicalLoanHandler,
		JWTService:          jwtService,
	})

	if err := app.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}