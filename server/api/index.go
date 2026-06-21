package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/literasiKu/database/config"
	"github.com/literasiKu/modules/auth/handler"
	authrepo "github.com/literasiKu/modules/auth/repository"
	authservice "github.com/literasiKu/modules/auth/service"
	"github.com/literasiKu/router"
)

var (
	engine  *gin.Engine
	initErr error
)

func init() {
	gin.SetMode(gin.ReleaseMode)

	// Debug: log semua env vars terkait database
	log.Printf("[DEBUG] DATABASE_URL length=%d", len(os.Getenv("DATABASE_URL")))
	log.Printf("[DEBUG] DB_HOST=%q", os.Getenv("DB_HOST"))
	log.Printf("[DEBUG] DB_PORT=%q", os.Getenv("DB_PORT"))
	log.Printf("[DEBUG] DB_USER=%q", os.Getenv("DB_USER"))
	log.Printf("[DEBUG] DB_NAME=%q", os.Getenv("DB_NAME"))
	log.Printf("[DEBUG] DB_SSLMODE=%q", os.Getenv("DB_SSLMODE"))
	log.Printf("[DEBUG] DB_PASSWORD length=%d", len(os.Getenv("DB_PASSWORD")))

	cfg := config.LoadConfig()
	if err := config.Connect(cfg); err != nil {
		// JANGAN panic — simpan error dan tampilkan lewat API
		initErr = fmt.Errorf("database connection failed: %w", err)
		log.Printf("[ERROR] %v", initErr)
		return
	}

	jwtService := authservice.NewJWTService()
	authRepo := authrepo.NewAuthRepository(config.GetDB())
	authSvc := authservice.NewAuthService(authRepo, jwtService)
	authHandler := handler.NewAuthHandler(authSvc)

	engine = router.New(router.Deps{
		AuthHandler: authHandler,
		JWTService:  jwtService,
	})
}

func Handler(w http.ResponseWriter, r *http.Request) {
	// Jika init gagal, tampilkan error detail alih-alih crash
	if initErr != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]any{
			"status":  "error",
			"message": "server initialization failed",
			"error":   initErr.Error(),
			"debug": map[string]any{
				"database_url_set": os.Getenv("DATABASE_URL") != "",
				"db_host":          os.Getenv("DB_HOST"),
				"db_name":          os.Getenv("DB_NAME"),
				"db_sslmode":       os.Getenv("DB_SSLMODE"),
			},
		})
		return
	}

	engine.ServeHTTP(w, r)
}