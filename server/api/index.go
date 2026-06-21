package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

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

	cfg := config.LoadConfig()
	if err := config.Connect(cfg); err != nil {
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