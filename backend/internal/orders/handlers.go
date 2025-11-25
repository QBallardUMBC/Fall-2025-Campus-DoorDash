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
	if err := c.ShouldBindJSON(&req); err != nil{ c.JSON(http.StatusBadRequest, gin.H{"error":"invalid request body"})
		return
	}
	log.Printf("Incoming order: %+v\n", req)
	if len(req.OrderItems) == 0{
		c.JSON(http.StatusBadRequest, gin.H{"error": "order must contain at least 1 item"})
		return
	}
	log.Println(req.CustomerID)	
	log.Println(authenticatedUserID)
	order, clientSecret, err := h.service.CreateOrder(c.Request.Context(), req)

	if err != nil{
		log.Printf("failed to create order: %v", err)	
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create order",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"order": order, 
	"client_secret": clientSecret})
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

func (h * OrderHandlers) GetAvailableOrdersHandler(c * gin.Context){
	isDasher := c.GetBool("is_dasher")

	if !isDasher{
		c.JSON(http.StatusForbidden, gin.H{
			"error":"access restricted to dashers",
		})
		return
	}

	orders, err := h.service.GetAvailableOrders(c.Request.Context())

	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch available orders",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"available_orders": orders, 
		"count": len(orders),
	})
}

func (h * OrderHandlers) AcceptOrderHandler(c * gin.Context){
	isDasher := c.GetBool("is_dasher")

	if !isDasher{
		c.JSON(http.StatusForbidden, gin.H{
			"error": "access restricted to dashers",
		})
		return
	}

	dasherID, err := uuid.Parse(c.GetString("user_id"))
	if err != nil{

		log.Println("dasher id error here!!!", err)
		log.Println("user id here!!!! in order handler file", c.GetString("user_id"))
		c.JSON(http.StatusInternalServerError,gin.H{
				"error": "invalid dasher id",
			})

		return
	}

	orderID, err := uuid.Parse(c.Param("id"))
	if err != nil{	
		c.JSON(http.StatusInternalServerError,gin.H{
				"error": "invalid order id",
			})

		return
	}	

	err = h.service.AcceptOrder(c.Request.Context(), orderID, dasherID)

	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "order accepted successfully",
		"order_id":   orderID,
		"dasher_id":  dasherID,
		"new_status": StatusConfirmed,
	})
}

func (h * OrderHandlers) GetDasherOrdersHandler(c * gin.Context){
	isDasher := c.GetBool("is_dasher")
	if !isDasher{
		c.JSON(http.StatusForbidden, gin.H{
			"error":"access restricted to dashers",
		})

		return 
	}

	dasherID, err := uuid.Parse(c.GetString("user_id"))
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid dasher id"})
		return
	}
	
	orders, err := h.service.GetOrdersByDasherID(c.Request.Context(), dasherID)
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch dasher orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"count":  len(orders),
	})
}

func (h * OrderHandlers) GetHistory(c * gin.Context){
	
	userID, err := uuid.Parse(c.GetString("user_id"))

	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id"})
		return
	}

	history, err := h.service.CheckUserHistory(c.Request.Context(), userID)
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check user history"})
		return
	}


	c.JSON(http.StatusOK, gin.H{
		"order_history": history,
		"count":  len(history),
	})
}

func (h * OrderHandlers) CompleteOrderHandler(c * gin.Context){
	isDasher := c.GetBool("is_dasher")
	if !isDasher {
		c.JSON(http.StatusForbidden, gin.H{"error": "access restricted to dashers"})
		return
	}
	
	orderID, err := uuid.Parse(c.Param("id"))

	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order ID"})
		return
	}
	
	userID := c.GetString("user_id")
	dasherID, err := uuid.Parse(userID)
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error" : "invalid dasher id"})
		return
	}

	success, err := h.service.CompleteOrder(c.Request.Context(), orderID, dasherID)
	if err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if success{
		c.JSON(http.StatusOK, gin.H{
			"message":    "order marked as delivered successfully",
			"order_id":   orderID,
			"dasher_id":  dasherID,
			"new_status": StatusDelivered,
		})
	}
}

