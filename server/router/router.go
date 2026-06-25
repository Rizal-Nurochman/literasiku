package router

import (
	"net/http"

	"github.com/literasiKu/middlewares"
	authhandler "github.com/literasiKu/modules/auth/handler"
	bookhandler "github.com/literasiKu/modules/book/handler"
	"github.com/literasiKu/modules/auth/service"
	healthhandler "github.com/literasiKu/modules/health/handler"
	"github.com/gin-gonic/gin"
)

type Deps struct {
	AuthHandler     authhandler.AuthHandler
	BookHandler     bookhandler.BookHandler
	CategoryHandler bookhandler.BookCategoryHandler
	FileHandler     bookhandler.FileHandler
	JWTService      service.JWTService
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

		books := api.Group("/books")
		{
			books.GET("", deps.BookHandler.GetAll)
			books.GET("/:id", deps.BookHandler.GetByID)

			books.Use(middlewares.Authenticate(deps.JWTService))
			books.POST("", deps.BookHandler.Create)
			books.PUT("/:id", deps.BookHandler.Update)
			books.DELETE("/:id", deps.BookHandler.Delete)
		}

		categories := api.Group("/categories")
		{
			categories.GET("", deps.CategoryHandler.GetAll)
			categories.GET("/:id", deps.CategoryHandler.GetByID)

			categories.Use(middlewares.Authenticate(deps.JWTService))
			categories.POST("", deps.CategoryHandler.Create)
			categories.PUT("/:id", deps.CategoryHandler.Update)
			categories.DELETE("/:id", deps.CategoryHandler.Delete)
		}

		files := api.Group("/files")
		{
			files.GET("/book/:book_id", deps.FileHandler.GetByBookID)
			files.GET("/:id", deps.FileHandler.GetByID)

			files.Use(middlewares.Authenticate(deps.JWTService))
			files.POST("", deps.FileHandler.Create)
			files.PUT("/:id", deps.FileHandler.Update)
			files.DELETE("/:id", deps.FileHandler.Delete)
		}
	}

	return r
}
