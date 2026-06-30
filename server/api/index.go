package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
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
	digitalloanrepo "github.com/literasiKu/modules/digital_loan/repository"
	digitalloanservice "github.com/literasiKu/modules/digital_loan/service"
	digitalloanhandler "github.com/literasiKu/modules/digital_loan/handler"
	uploadhandler "github.com/literasiKu/modules/upload/handler"
	"github.com/literasiKu/router"
)

var (
	engine  *gin.Engine
	initErr error
)

func init() {
	gin.SetMode(gin.ReleaseMode)

	cfg := config.LoadConfig()
	if err := config.Connect(cfg); err != nil {
		initErr = fmt.Errorf("database connection failed: %w", err)
		log.Printf("[ERROR] %v", initErr)
		return
	}

	if err := database.AutoMigrate(); err != nil {
		initErr = fmt.Errorf("auto migrate failed: %w", err)
		log.Printf("[ERROR] %v", initErr)
		return
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

	engine = router.New(router.Deps{
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
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if initErr != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]any{
			"status":  "error",
			"message": "server initialization failed",
		})
		return
	}

	engine.ServeHTTP(w, r)
}