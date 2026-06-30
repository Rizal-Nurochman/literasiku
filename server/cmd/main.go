package main

import (
	"flag"
	"log"

	"github.com/literasiKu/database"
	"github.com/literasiKu/database/config"
	"github.com/literasiKu/modules/auth/handler"
	authrepo "github.com/literasiKu/modules/auth/repository"
	authservice "github.com/literasiKu/modules/auth/service"
	bookhandler "github.com/literasiKu/modules/book/handler"
	bookrepo "github.com/literasiKu/modules/book/repository"
	bookservice "github.com/literasiKu/modules/book/service"
	categoryhandler "github.com/literasiKu/modules/category/handler"
	categoryrepo "github.com/literasiKu/modules/category/repository"
	categoryservice "github.com/literasiKu/modules/category/service"
	digitalloanhandler "github.com/literasiKu/modules/digital_loan/handler"
	digitalloanrepo "github.com/literasiKu/modules/digital_loan/repository"
	digitalloanservice "github.com/literasiKu/modules/digital_loan/service"
	filehandler "github.com/literasiKu/modules/file/handler"
	filerepo "github.com/literasiKu/modules/file/repository"
	fileservice "github.com/literasiKu/modules/file/service"
	physicalloanhandler "github.com/literasiKu/modules/physical_loan/handler"
	physicalloanrepo "github.com/literasiKu/modules/physical_loan/repository"
	physicalloanservice "github.com/literasiKu/modules/physical_loan/service"
	userhandler "github.com/literasiKu/modules/user/handler"
	userrepo "github.com/literasiKu/modules/user/repository"
	userservice "github.com/literasiKu/modules/user/service"
	uploadhandler "github.com/literasiKu/modules/upload/handler"
	"github.com/literasiKu/router"
)

func main() {
	seedFlag := flag.Bool("seed", false, "Run database seeder")
	flag.Parse()
	
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

	if *seedFlag {
		if err := database.Seeder(db); err != nil {
			log.Fatalf("failed to seed database: %v", err)
		}
		log.Println("Seeding completed successfully")
		return
	}
 
	jwtService := authservice.NewJWTService()
	authRepo := authrepo.NewAuthRepository(db)
	authSvc := authservice.NewAuthService(authRepo, jwtService)
	authHandler := handler.NewAuthHandler(authSvc)

	bookRepo := bookrepo.NewBookRepository(db)
	categoryRepo := categoryrepo.NewCategoryRepository(db)
	fileRepo := filerepo.NewFileRepository(db)
	userRepo := userrepo.NewUserRepository(db)
	physicalLoanRepo := physicalloanrepo.NewPhysicalLoanRepository(db)
	digitalLoanRepo := digitalloanrepo.NewDigitalLoanRepository(db)

	bookSvc := bookservice.NewBookService(bookRepo, categoryRepo)
	categorySvc := categoryservice.NewCategoryService(categoryRepo)
	fileSvc := fileservice.NewFileService(fileRepo, bookRepo)
	userSvc := userservice.NewUserService(userRepo)
	physicalLoanSvc := physicalloanservice.NewPhysicalLoanService(physicalLoanRepo, bookRepo)
	digitalLoanSvc := digitalloanservice.NewDigitalLoanService(digitalLoanRepo, bookRepo, fileRepo)

	bookHandler := bookhandler.NewBookHandler(bookSvc)
	categoryHandler := categoryhandler.NewCategoryHandler(categorySvc)
	fileHandler := filehandler.NewFileHandler(fileSvc)
	userHandler := userhandler.NewUserHandler(userSvc)
	physicalLoanHandler := physicalloanhandler.NewPhysicalLoanHandler(physicalLoanSvc)
	digitalLoanHandler := digitalloanhandler.NewDigitalLoanHandler(digitalLoanSvc)
	uploadHandler := uploadhandler.NewUploadHandler()

	app := router.New(router.Deps{
		AuthHandler:         authHandler,
		BookHandler:         bookHandler,
		CategoryHandler:     categoryHandler,
		FileHandler:         fileHandler,
		UserHandler:         userHandler,
		PhysicalLoanHandler: physicalLoanHandler,
		DigitalLoanHandler:  digitalLoanHandler,
		UploadHandler:       uploadHandler,
		JWTService:          jwtService,
	})

	if err := app.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}