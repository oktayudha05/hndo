package handlers

import (
	"honey/internal/models"
	"honey/internal/repository"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TodoHandler meng-handle endpoints todo
type TodoHandler struct {
	todoRepo *repository.TodoRepository
}

type CreateTodoRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"start_time" binding:"required"`
	EndTime     time.Time `json:"end_time" binding:"required"`
}

func NewTodoHandler(todoRepo *repository.TodoRepository) *TodoHandler {
	return &TodoHandler{
		todoRepo: todoRepo,
	}
}

// helper: ambil user_id dari context
func getUserIDFromCtx(c *gin.Context) (primitive.ObjectID, bool) {
	val, exists := c.Get("user_id")
	if !exists {
		return primitive.NilObjectID, false
	}
	uid, ok := val.(primitive.ObjectID)
	return uid, ok
}

// CreateTodo membuat todo baru (terikat ke user dari session)
func (h *TodoHandler) CreateTodo(c *gin.Context) {
	var req CreateTodoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, ok := getUserIDFromCtx(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	todo := models.Todo{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		IsCompleted: false,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	createdTodo, err := h.todoRepo.CreateTodo(c.Request.Context(), todo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdTodo)
}

// GetTodos mengembalikan semua todo milik user yang sedang login
func (h *TodoHandler) GetTodos(c *gin.Context) {
	userID, ok := getUserIDFromCtx(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	todos, err := h.todoRepo.FindByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"todos": todos})
}

// UpdateTodo mengupdate todo milik user (cek ownership)
func (h *TodoHandler) UpdateTodo(c *gin.Context) {
	todoID := c.Param("id")
	var req CreateTodoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	oid, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid todo ID"})
		return
	}

	userID, ok := getUserIDFromCtx(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// verify ownership by scanning user's todos
	userTodos, err := h.todoRepo.FindByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var found *models.Todo
	for i := range userTodos {
		if userTodos[i].ID == oid {
			found = &userTodos[i]
			break
		}
	}
	if found == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	// apply updates (preserve ID and UserID)
	found.Title = req.Title
	found.Description = req.Description
	found.StartTime = req.StartTime
	found.EndTime = req.EndTime
	found.UpdatedAt = time.Now()

	if err := h.todoRepo.Update(oid, found); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Todo updated successfully", "todo": found})
}

// DeleteTodo menghapus todo milik user (cek ownership)
func (h *TodoHandler) DeleteTodo(c *gin.Context) {
	todoID := c.Param("id")

	oid, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid todo ID"})
		return
	}

	userID, ok := getUserIDFromCtx(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// verify ownership
	userTodos, err := h.todoRepo.FindByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	found := false
	for _, t := range userTodos {
		if t.ID == oid {
			found = true
			break
		}
	}
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	if err := h.todoRepo.Delete(oid); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Todo deleted successfully", "id": oid.Hex()})
}

// ToggleTodoStatus membalikkan status selesai/belum, cuma untuk owner
func (h *TodoHandler) ToggleTodoStatus(c *gin.Context) {
	todoID := c.Param("id")

	oid, err := primitive.ObjectIDFromHex(todoID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid todo ID"})
		return
	}

	userID, ok := getUserIDFromCtx(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// ambil semua todo user, cari yang dimaksud
	userTodos, err := h.todoRepo.FindByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var found *models.Todo
	for i := range userTodos {
		if userTodos[i].ID == oid {
			found = &userTodos[i]
			break
		}
	}
	if found == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	// toggle
	found.IsCompleted = !found.IsCompleted
	found.UpdatedAt = time.Now()

	if err := h.todoRepo.Update(oid, found); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Todo status toggled", "todo": found})
}
