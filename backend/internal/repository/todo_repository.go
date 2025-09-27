// internal/repository/todo_repository.go
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

type TodoRepository struct {
	db         *database.MongoDB
	collection *mongo.Collection
}

func NewTodoRepository(db *database.MongoDB) *TodoRepository {
	return &TodoRepository{
		db:         db,
		collection: db.Collection("todos"),
	}
}

// CreateTodo inserts a todo and returns the created document
func (r *TodoRepository) CreateTodo(ctx context.Context, t models.Todo) (models.Todo, error) {
	ctxc, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctxc, t)
	return t, err
}

func (r *TodoRepository) FindByUserID(userID primitive.ObjectID) ([]models.Todo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cur, err := r.collection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var todos []models.Todo
	for cur.Next(ctx) {
		var t models.Todo
		if err := cur.Decode(&t); err != nil {
			return nil, err
		}
		todos = append(todos, t)
	}
	return todos, nil
}

func (r *TodoRepository) FindByID(id primitive.ObjectID) (*models.Todo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var t models.Todo
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&t)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TodoRepository) Update(id primitive.ObjectID, updated *models.Todo) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Use $set with the fields we want to update
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": updated})
	return err
}

func (r *TodoRepository) Delete(id primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
