package main

import (
	"campusDoordash/internal/auth"
	"campusDoordash/internal/orders"
	"campusDoordash/internal/payments"
	"campusDoordash/internal/restaurants"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {

		log.Println("hello? what is the error")
		log.Fatal("error loading env file")
	}
	auth.InitDB()
	payments.InitKey()
	log.Println("stripe api key", os.Getenv("STRIPE_API_KEY"))
	auth.SetupAuthClient()
	restaurantService := restaurants.NewRestaurantService(auth.Conn)
	restaurantHandlers := restaurants.NewRestaurantHandler(restaurantService)

	orderService := orders.NewOrderService(auth.Conn)
	orderHandlers := orders.NewOrderHandlers(orderService)
	router := gin.Default()
	enableCors(router)
	router.GET("/auth", auth.AuthHandler)
	router.POST("/auth/register", auth.RegisterHandler)
	router.POST("/auth/login", auth.LoginHandler)
	router.POST("/auth/refresh", auth.RefreshTokenHandler)
	router.GET("/test-protected", auth.AuthMiddleware(), func(c *gin.Context) {
		user, _ := c.Get("user")
		c.JSON(http.StatusOK, gin.H{
			"message": "you are authenticated!",
			"user":    user,
		})
	})

	//protected api routes
	protected := router.Group("/api")
	protected.Use(auth.AuthMiddleware())
	{
		//payment routes
		protected.POST("/create-payment", payments.CreatePaymentHandler)
		//restaurant routes
		protected.GET("/restaurants", restaurantHandlers.GetAllRestaurantHandlers)
		
		protected.GET("/restaurants/:id", restaurantHandlers.GetRestaurantByID)

		protected.GET("/restaurants/:id/menu", restaurantHandlers.GetRestaurantMenuHandler)
		//order routes
		protected.POST("/orders", orderHandlers.CreateOrderHandler)
		protected.GET("/orders/:id", orderHandlers.GetOrderByIDHandler)
		protected.GET("/customers/:customer_id/orders", orderHandlers.GetCustomerOrdersHandler)
		protected.GET("/restaurants/:id/orders", orderHandlers.GetRestaurantOrdersHandlers)
		protected.POST("/orders/:id/status", orderHandlers.UpdateOrderStatusHandler)
		protected.POST("/orders/:id/dasher", orderHandlers.AssignDasherHandler)

	}
	router.Run(":8080")
}

func enableCors(e *gin.Engine) {
	e.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://foo.com"},
		AllowMethods:     []string{"PUT", "PATCH"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			return origin == "https://github.com"
		},
		MaxAge: 12 * time.Hour,
	}))

}
