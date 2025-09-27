package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username  string            `bson:"username" json:"username"`
	Email     string            `bson:"email" json:"email"`
	Password  string            `bson:"password" json:"-"` // '-' means this field won't be included in JSON responses
	CreatedAt time.Time         `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time         `bson:"updated_at" json:"updated_at"`
}

type Todo struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Title       string            `bson:"title" json:"title"`
	Description string            `bson:"description" json:"description"`
	StartTime   time.Time         `bson:"start_time" json:"start_time"`
	EndTime     time.Time         `bson:"end_time" json:"end_time"`
	IsCompleted bool              `bson:"is_completed" json:"is_completed"`
	CreatedAt   time.Time         `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time         `bson:"updated_at" json:"updated_at"`
}

type Calendar struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Title       string            `bson:"title" json:"title"`
	Description string            `bson:"description" json:"description"`
	StartTime   time.Time         `bson:"start_time" json:"start_time"`
	EndTime     time.Time         `bson:"end_time" json:"end_time"`
	Color       string            `bson:"color" json:"color"`
	IsAllDay    bool              `bson:"is_all_day" json:"is_all_day"`
	CreatedAt   time.Time         `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time         `bson:"updated_at" json:"updated_at"`
}