package database

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
)

type RedisClient struct {
	client *redis.Client
	prefix string
}

func NewRedisClient(uri, password, prefix string) (*RedisClient, error) {
	// Parse host and port from uri (format: "host:port")
	client := redis.NewClient(&redis.Options{
		Addr:     uri,     // host:port
		Password: password,
		DB:       0,  // use default DB
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return &RedisClient{
		client: client,
		prefix: prefix,
	}, nil
}

func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.client.Set(ctx, r.prefix+":"+key, value, expiration).Err()
}

func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	return r.client.Get(ctx, r.prefix+":"+key).Result()
}

func (r *RedisClient) Del(ctx context.Context, key string) error {
	return r.client.Del(ctx, r.prefix+":"+key).Err()
}