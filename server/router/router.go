package router

import (
	"net/http"

	"github.com/literasiKu/middlewares"
	authhandler "github.com/literasiKu/modules/auth/handler"
	bookhandler "github.com/literasiKu/modules/book/handler"
	categoryhandler "github.com/literasiKu/modules/category/handler"
	filehandler "github.com/literasiKu/modules/file/handler"
	"github.com/literasiKu/modules/auth/service"
	healthhandler "github.com/literasiKu/modules/health/handler"
	userhandler "github.com/literasiKu/modules/user/handler"
	"github.com/gin-gonic/gin"
)

type Deps struct {
	AuthHandler     authhandler.AuthHandler
	BookHandler     bookhandler.BookHandler
	CategoryHandler categoryhandler.CategoryHandler
	FileHandler     filehandler.FileHandler
	UserHandler     userhandler.UserHandler
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
			// public
			books.GET("", deps.BookHandler.GetAll)
			books.GET("/:id", deps.BookHandler.GetByID)

			// admin only
			adminBooks := books.Group("")
			adminBooks.Use(middlewares.Authenticate(deps.JWTService), middlewares.AdminOnly())
			adminBooks.POST("", deps.BookHandler.Create)
			adminBooks.PATCH("/:id", deps.BookHandler.Update)
			adminBooks.DELETE("/:id", deps.BookHandler.Delete)
		}

		categories := api.Group("/categories")
		{
			// public
			categories.GET("", deps.CategoryHandler.GetAll)
			categories.GET("/:id", deps.CategoryHandler.GetByID)

			// admin only
			adminCategories := categories.Group("")
			adminCategories.Use(middlewares.Authenticate(deps.JWTService), middlewares.AdminOnly())
			adminCategories.POST("", deps.CategoryHandler.Create)
			adminCategories.PATCH("/:id", deps.CategoryHandler.Update)
			adminCategories.DELETE("/:id", deps.CategoryHandler.Delete)
		}

		files := api.Group("/files")
		files.Use(middlewares.Authenticate(deps.JWTService))
		{
			// auth only
			files.GET("/book/:book_id", deps.FileHandler.GetByBookID)
			files.GET("/:id", deps.FileHandler.GetByID)

			// admin only
			adminFiles := files.Group("")
			adminFiles.Use(middlewares.AdminOnly())
			adminFiles.POST("", deps.FileHandler.Create)
			adminFiles.PATCH("/:id", deps.FileHandler.Update)
			adminFiles.DELETE("/:id", deps.FileHandler.Delete)
		}

		users := api.Group("/users")
		users.Use(middlewares.Authenticate(deps.JWTService))
		{
			// auth only (own profile)
			users.GET("/me", deps.UserHandler.Me)
			users.PATCH("/me", deps.UserHandler.UpdateMe)

			// admin only
			adminUsers := users.Group("")
			adminUsers.Use(middlewares.AdminOnly())
			adminUsers.GET("", deps.UserHandler.GetAll)
			adminUsers.GET("/:id", deps.UserHandler.GetByID)
			adminUsers.PATCH("/:id", deps.UserHandler.Update)
			adminUsers.DELETE("/:id", deps.UserHandler.Delete)
		}
	}

	return r
}