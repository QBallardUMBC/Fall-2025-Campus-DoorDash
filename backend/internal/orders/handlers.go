package orders

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OrderHandlers struct{
	service * OrderService
}

func NewOrderHandlers(service *OrderService) *OrderHandlers{
	return &OrderHandlers{service: service}
}

func (h * OrderHandlers) CreateOrderHandler (c * gin.Context){	
	userID,exists := c.Get("user_id")
	
	if !exists{
		c.JSON(http.StatusBadRequest, gin.H{"error":"invalid customer id"})
		return
	}
	
	authenticatedUserID, ok := userID.(uuid.UUID)
	if !ok{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID format"}) 
		return
	}
	var req CreateOrderRequest	
	if err := c.ShouldBindJSON(&req); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error":"invalid request body"})
		return
	}

	if len(req.OrderItems) == 0{
		c.JSON(http.StatusBadRequest, gin.H{"error": "order must contain at least 1 item"})
		return
	}
	
	req.CustomerID = authenticatedUserID
	order,err := h.service.CreateOrder(c.Request.Context(), req)

	if err != nil{
		log.Printf("failed to create order: %v", err)	
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create order",
		})
		return
	}

	c.JSON(http.StatusCreated, order)
}	

func (h * OrderHandlers) GetOrderByIDHandler(c * gin.Context){
	orderID, err := uuid.Parse(c.Param("id"))		
	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid order id",
		})
		return
	}

	order, err := h.service.GetOrderByID(c.Request.Context(), orderID)
	if err != nil{
		c.JSON(http.StatusNotFound, gin.H{
			"error":"invalid order ID",
		})
		return
	}
	c.JSON(http.StatusOK, order)
}

func(h * OrderHandlers) GetCustomerOrdersHandler(c * gin.Context){
	customerID, err := uuid.Parse(c.Param("customer_id"))
	if err != nil{
		c.JSON(
			http.StatusBadRequest, gin.H{
				"error": "invalid customer ID",
			})
		return
	}
		
	orders, err := h.service.GetOrdersByCustomerID(c.Request.Context(), customerID)

	
	if err != nil{
		log.Printf("failed to fetch customer orders %v", err)
		c.JSON(		
			http.StatusBadRequest, gin.H{
				"error": "customer has no order",
			})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"orders": orders, 
		"count": len(orders),
	})	
}

func(h * OrderHandlers) GetRestaurantOrdersHandlers(c * gin.Context){
	restaurantID , err := uuid.Parse(c.Param("id"))
	if err != nil{
		c.JSON(
		http.StatusBadRequest, 
		gin.H{"error":"invalid restaurant id"},
		)

		return 
	}

	orders,err := h.service.GetOrderByRestaurantID(c.Request.Context(), restaurantID)

	if err != nil{
		c.JSON(
		http.StatusInternalServerError, 
		gin.H{"error":"failed to fetch orders"},
		)

		return 
	}

	c.JSON(http.StatusOK,gin.H{
		"orders": orders, 
		"count": len(orders),
	})

}

func(h * OrderHandlers) UpdateOrderStatusHandler(c * gin.Context){
	orderID, err := uuid.Parse(c.Param("id"))
	
	if err != nil{
		c.JSON(
		http.StatusBadRequest, 
		gin.H{"error":"invalid order id"},
		)
		return 
	}
	
	var req struct{
		Status OrderStatus `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil{
		
		c.JSON(
		http.StatusBadRequest, 
		gin.H{"error":"invalid request body"},
		)
		return 
	}

	//valid statuses
	validstatuses := map[OrderStatus]bool{
		StatusPending: 		true, 
		StatusConfirmed: 	true, 
		StatusPreparing: 	true,
		StatusReady:		true, 
		StatusPickedUp:		true, 
		StatusDelivered:	true,
		StatusCancelled: 	true,
	}

	if !validstatuses[req.Status]{
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		return
	}
	
	err = h.service.UpdateOrderStatus(c.Request.Context(), orderID, req.Status)
	if err != nil{
		log.Printf("failed to update order status: %v", err)
		c.JSON(	
			http.StatusInternalServerError, 
			gin.H{"error":"Failed to update order status"},
		)
		return 
	}

	c.JSON(http.StatusOK, gin.H{"message": "order status updated succesfully"})
}


func (h * OrderHandlers) AssignDasherHandler(c *gin.Context){
	orderID, err := uuid.Parse(c.Param("id"))
	
	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}

	var req struct{
		DasherID uuid.UUID `json:"dasher_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	err = h.service.AssignDasher(c.Request.Context(), orderID, req.DasherID)
	if err != nil{
		log.Printf("failed to assign dasher %v", err) 
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assign dasher"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"error": "dasher assigned succesfully"})
}

