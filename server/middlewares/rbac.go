package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/literasiKu/modules/auth/dto"
	"github.com/literasiKu/pkg/utils"
)

func AdminOnly() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if ctx.GetString("role") != "ADMIN" {
			response := utils.BuildResponseFailed(dto.MESSAGE_FAILED_PROSES_REQUEST, "access denied: admin only", nil)
			ctx.AbortWithStatusJSON(http.StatusForbidden, response)
			return
		}
		ctx.Next()
	}
}
