package restaurants

import(
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RestaurantHandlers struct{
	service * RestaurantService
}

func NewRestaurantHandler(service * RestaurantService) *RestaurantHandlers{
	return &RestaurantHandlers{service: service} 
}

func (h * RestaurantHandlers) GetAllRestaurantHandlers(c *gin.Context){
	restaurants, err := h.service.GetAllRestaurants(c.Request.Context())
	if err != nil{
		log.Printf("failed to fetch restaurants %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error":"failed to fetch restaurants",})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"restaurants": restaurants,
	})
}


func (h * RestaurantHandlers) GetRestaurantByID(c * gin.Context){
	restaurantID, err := uuid.Parse(c.Param("id"))
	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid restaurant ID",})
		return
	}

	restaurant, err := h.service.GetRestaurantsByID(c.Request.Context(), restaurantID)
	
	if err != nil{
		c.JSON(http.StatusNotFound, gin.H{
			"error" : "restaurant not found",
		})
		return
	}

	c.JSON(http.StatusOK, restaurant)
}


func (h* RestaurantHandlers) GetRestaurantMenuHandler(c * gin.Context){
	restaurantID, err := uuid.Parse(c.Param("id"))
	
	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{
			"error" : "invalid restaurant ID",
		})
		return
	}
	
	menu, err := h.service.GetRestaurantMenu(c.Request.Context(), restaurantID)
	if err != nil{
		log.Printf("failed to fetch menu %V", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch menu",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{"menu": menu})
	
}

