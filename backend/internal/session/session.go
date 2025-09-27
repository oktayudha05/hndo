package session

import (
	"context"
	"encoding/json"
	"honey/internal/database"
	"time"

	"github.com/google/uuid"
)

const (
	sessionExpiration = 24 * time.Hour
)

type SessionManager struct {
	redis *database.RedisClient
}

type SessionData struct {
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"created_at"`
}

func NewSessionManager(redis *database.RedisClient) *SessionManager {
	return &SessionManager{
		redis: redis,
	}
}

func (sm *SessionManager) CreateSession(ctx context.Context, userID, username string) (string, error) {
	sessionID := uuid.New().String()
	sessionData := SessionData{
		UserID:    userID,
		Username:  username,
		CreatedAt: time.Now(),
	}

	data, err := json.Marshal(sessionData)
	if err != nil {
		return "", err
	}

	if err := sm.redis.Set(ctx, sessionID, string(data), sessionExpiration); err != nil {
		return "", err
	}

	return sessionID, nil
}

func (sm *SessionManager) GetSession(ctx context.Context, sessionID string) (*SessionData, error) {
	data, err := sm.redis.Get(ctx, sessionID)
	if err != nil {
		return nil, err
	}

	var sessionData SessionData
	if err := json.Unmarshal([]byte(data), &sessionData); err != nil {
		return nil, err
	}

	return &sessionData, nil
}

func (sm *SessionManager) DeleteSession(ctx context.Context, sessionID string) error {
	return sm.redis.Del(ctx, sessionID)
}