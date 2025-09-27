package middleware

import (
	"honey/internal/session"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthMiddleware struct {
	sessionManager *session.SessionManager
}

func NewAuthMiddleware(sessionManager *session.SessionManager) *AuthMiddleware {
	return &AuthMiddleware{
		sessionManager: sessionManager,
	}
}

func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get session ID from cookie
		sessionID, err := c.Cookie("session_id")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// Get session data
		sessionData, err := m.sessionManager.GetSession(c.Request.Context(), sessionID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
			c.Abort()
			return
		}

		// Convert string ID to ObjectID
		userID, err := primitive.ObjectIDFromHex(sessionData.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
			c.Abort()
			return
		}

		// Set user data in context
		c.Set("user_id", userID)
		c.Set("username", sessionData.Username)

		c.Next()
	}
}