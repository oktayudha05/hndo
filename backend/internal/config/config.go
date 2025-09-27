package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI    string
	RedisURI    string
	RedisPass   string
	RedisKey    string
	Port        string
	Env         string
	FrontendURL string
}

func LoadConfig() *Config {
	// Try to load .env from different possible locations
	if err := godotenv.Load(); err != nil {
		// Try loading from parent directory
		if err := godotenv.Load("../.env"); err != nil {
			log.Printf("Warning: .env file not found in current or parent directory: %v", err)
		}
	}

	config := &Config{
		MongoURI:    getEnv("MONGODB_URI", ""),
		RedisURI:    getEnv("REDIS_URI", ""),
		RedisPass:   getEnv("REDIS_PASS", ""),
		RedisKey:    getEnv("REDIS_KEY", ""),
		Port:        getEnv("PORT", "8080"),
		Env:         getEnv("ENV", "development"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
	}

	return config
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}