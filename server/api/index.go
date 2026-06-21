package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/literasiKu/database/config"
	"github.com/literasiKu/modules/auth/handler"
	authrepo "github.com/literasiKu/modules/auth/repository"
	authservice "github.com/literasiKu/modules/auth/service"
	"github.com/literasiKu/router"
)

var engine *gin.Engine

func init() {
	gin.SetMode(gin.ReleaseMode)

	cfg := config.LoadConfig()
	if err := config.Connect(cfg); err != nil {
		panic("failed to connect database: " + err.Error())
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
	engine.ServeHTTP(w, r)
}