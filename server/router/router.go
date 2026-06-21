package router

import (
	"net/http"

	"github.com/literasiKu/middlewares"
	authhandler "github.com/literasiKu/modules/auth/handler"
	"github.com/literasiKu/modules/auth/service"
	healthhandler "github.com/literasiKu/modules/health/handler"
	"github.com/gin-gonic/gin"
)

type Deps struct {
	AuthHandler authhandler.AuthHandler
	JWTService  service.JWTService
}

func New(deps Deps) *gin.Engine {
	r := gin.New()

	r.Use(gin.Logger(), gin.Recovery(), middlewares.CORSMiddleware())

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Literasiku API",
		})
	})

	api := r.Group("/api/v1")
	{
		api.GET("/health", healthhandler.Health)

		auth := api.Group("/auth")
		{
			auth.POST("/register", deps.AuthHandler.Register)
			auth.POST("/login", deps.AuthHandler.Login)

			auth.Use(middlewares.Authenticate(deps.JWTService))
			auth.POST("/logout", deps.AuthHandler.Logout)
		}
	}

	return r
}
