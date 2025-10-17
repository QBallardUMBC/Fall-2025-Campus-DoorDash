package orders

import(
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
_	"github.com/google/uuid"
)

type OrderHandlers struct{
	service * OrderService
}

func NewOrderHandlers(service *OrderService) *OrderHandlers{
	return &OrderHandlers{service: service}
}

func (h * OrderHandlers) CreateOrderHandler (c * gin.Context){
	var req CreateOrderRequest
	
	if err := c.ShouldBindJSON(&req); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error":"invalid request body"})
		return
	}

	if len(req.OrderItems) == 0{
		c.JSON(http.StatusBadRequest, gin.H{"error": "order must contain at least 1 item"})
		return
	}
	
	order,err := h.service.CreateOrder(c.Request.Context(), req)

	if err != nil{
		log.Printf("failed to create order: %v", err)	
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create order",
		})
	}

	c.JSON(http.StatusCreated, order)

}	

