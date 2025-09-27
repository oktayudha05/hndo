package main

import (
	"fmt"
	"honey/internal/config"
	"honey/internal/database"
	"honey/internal/handlers"
	"honey/internal/middleware"
	"honey/internal/repository"
	"honey/internal/session"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Set Gin mode based on environment
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", cfg.FrontendURL)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Initialize database connections
	mongodb, err := database.NewMongoDB(cfg.MongoURI)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongodb.Close()

	redisClient, err := database.NewRedisClient(cfg.RedisURI, cfg.RedisPass, cfg.RedisKey)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	// Initialize repositories and services
	userRepo := repository.NewUserRepository(mongodb)
	todoRepo := repository.NewTodoRepository(mongodb)
	calendarRepo := repository.NewCalendarRepository(mongodb)
	sessionManager := session.NewSessionManager(redisClient)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, sessionManager)
	todoHandler := handlers.NewTodoHandler(todoRepo)
	calendarHandler := handlers.NewCalendarHandler(calendarRepo)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(sessionManager)

	// Auth routes
	auth := router.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/logout", authHandler.Logout)
		auth.GET("/me", authMiddleware.RequireAuth(), authHandler.Me)
	}

	

	// Todo routes (protected)
	todos := router.Group("/api/todos", authMiddleware.RequireAuth())
	{
		todos.POST("", todoHandler.CreateTodo)
		todos.GET("", todoHandler.GetTodos)
		todos.PUT("/:id", todoHandler.UpdateTodo)
		todos.DELETE("/:id", todoHandler.DeleteTodo)
		todos.PUT("/:id/toggle", todoHandler.ToggleTodoStatus)
	}

	// Calendar routes (protected)
	calendar := router.Group("/api/calendar", authMiddleware.RequireAuth())
	{
		calendar.POST("/events", calendarHandler.CreateEvent)
		calendar.GET("/events", calendarHandler.GetEvents)
		calendar.PUT("/events/:id", calendarHandler.UpdateEvent)
		calendar.DELETE("/events/:id", calendarHandler.DeleteEvent)
	}

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Start server
	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on port %s", cfg.Port)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}