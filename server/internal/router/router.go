package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/literasiKu/internal/handler"
)

func New() *gin.Engine {
	r := gin.New()

	r.Use(gin.Logger(), gin.Recovery())

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Literasiku API",
		})
	})

	api := r.Group("/api")
	{
		api.GET("/health", handler.Health)
	}

	return r
}
