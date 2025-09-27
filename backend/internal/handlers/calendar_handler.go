package handlers

import (
	"honey/internal/models"
	"honey/internal/repository"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CalendarHandler struct {
	calendarRepo *repository.CalendarRepository
}

type CreateCalendarRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"start_time" binding:"required"`
	EndTime     time.Time `json:"end_time" binding:"required"`
	Color       string    `json:"color" binding:"required"`
	IsAllDay    bool      `json:"is_all_day"`
}

func NewCalendarHandler(calendarRepo *repository.CalendarRepository) *CalendarHandler {
	return &CalendarHandler{
		calendarRepo: calendarRepo,
	}
}

func (h *CalendarHandler) CreateEvent(c *gin.Context) {
    var req CreateCalendarRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Ambil user ID dari session (context)
    uid, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    userID, ok := uid.(primitive.ObjectID)
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
        return
    }

    event := models.Calendar{
        ID:          primitive.NewObjectID(),
        UserID:      userID,
        Title:       req.Title,
        Description: req.Description,
        StartTime:   req.StartTime,
        EndTime:     req.EndTime,
        Color:       req.Color,
        IsAllDay:    req.IsAllDay,
        CreatedAt:   time.Now(),
        UpdatedAt:   time.Now(),
    }

    if err := h.calendarRepo.Create(&event); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, event)
}


func (h *CalendarHandler) GetEvents(c *gin.Context) {
    // Ambil semua event (public)
    events, err := h.calendarRepo.FindAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"events": events})
}


func (h *CalendarHandler) UpdateEvent(c *gin.Context) {
	eventID := c.Param("id")
	var req CreateCalendarRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert string ID to ObjectID
	oid, err := primitive.ObjectIDFromHex(eventID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	updatedEvent := models.Calendar{
		Title:       req.Title,
		Description: req.Description,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Color:       req.Color,
		IsAllDay:    req.IsAllDay,
		UpdatedAt:   time.Now(),
	}

	if err := h.calendarRepo.Update(oid, &updatedEvent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Event updated successfully",
		"event":   updatedEvent,
	})
}

func (h *CalendarHandler) DeleteEvent(c *gin.Context) {
    eventID := c.Param("id")

    // Convert string ID to ObjectID
    oid, err := primitive.ObjectIDFromHex(eventID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
        return
    }

    if err := h.calendarRepo.Delete(oid); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully", "id": oid.Hex()})
}