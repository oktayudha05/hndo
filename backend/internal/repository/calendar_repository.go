// internal/repository/calendar_repository.go
package repository

import (
	"context"
	"honey/internal/database"
	"honey/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CalendarRepository struct {
	db         *database.MongoDB
	collection *mongo.Collection
}

func NewCalendarRepository(db *database.MongoDB) *CalendarRepository {
	return &CalendarRepository{
		db:         db,
		collection: db.Collection("calendar_events"),
	}
}

func (r *CalendarRepository) Create(event *models.Calendar) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	event.CreatedAt = time.Now()
	event.UpdatedAt = time.Now()

	_, err := r.collection.InsertOne(ctx, event)
	return err
}

func (r *CalendarRepository) FindByUserID(userID primitive.ObjectID) ([]models.Calendar, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cur, err := r.collection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var events []models.Calendar
	for cur.Next(ctx) {
		var event models.Calendar
		if err := cur.Decode(&event); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, nil
}

func (r *CalendarRepository) FindByDateRange(userID primitive.ObjectID, start, end time.Time) ([]models.Calendar, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"user_id":    userID,
		"start_time": bson.M{"$gte": start},
		"end_time":   bson.M{"$lte": end},
	}

	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var events []models.Calendar
	for cur.Next(ctx) {
		var event models.Calendar
		if err := cur.Decode(&event); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, nil
}

// FindAll returns all events (public)
func (r *CalendarRepository) FindAll() ([]models.Calendar, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cur, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var events []models.Calendar
	for cur.Next(ctx) {
		var event models.Calendar
		if err := cur.Decode(&event); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, nil
}

func (r *CalendarRepository) Update(id primitive.ObjectID, event *models.Calendar) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": event})
	return err
}

func (r *CalendarRepository) Delete(id primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
