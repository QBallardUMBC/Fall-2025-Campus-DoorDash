package payments

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/paymentintent"
)

type OrderPayment struct {
	OrderId          string  `json:"order_id"`
	FoodTotal        float64 `json:"food_total"`
	DeliveryFee      float64 `json:"delivery_fee"`
	DasherFee        float64 `json:"dasher_fee"`
	CustomerTotal    float64 `json:"customer_total"`
	RestaurantAmount float64 `json:"restaurant_amount"`
	DasherAmount     float64 `json:"dasher_amount"`
	PlatformAmount   float64 `json:"platform_amount"`
}

type PaymentRequest struct {
	FoodTotal float64 `json:"food_total" binding:"required"`
	OrderId   string  `json:"order_id" binding:"required"`
}

func CalculatePayment(foodTotal float64, orderId string) OrderPayment {
	deliveryFee := foodTotal * 0.05 //5 percent delivery fee
	dasherFee := 3.00               //dashers will always make base 3 dollars
	customerTotal := deliveryFee + dasherFee + foodTotal
	return OrderPayment{
		OrderId:          orderId, // Was missing
		FoodTotal:        foodTotal,
		DeliveryFee:      deliveryFee,
		DasherFee:        dasherFee,
		CustomerTotal:    customerTotal,
		RestaurantAmount: foodTotal,   // Restaurant gets food cost
		DasherAmount:     dasherFee,   // Dasher gets base fee (+ tips later)
		PlatformAmount:   deliveryFee, //

	}
}

func CreatePaymentIntent(payment OrderPayment) (*stripe.PaymentIntent, error) {
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(payment.CustomerTotal * 100)),
		Currency: stripe.String("usd"),
		Metadata: map[string]string{
			"order_id":     payment.OrderId,
			"food_total":   fmt.Sprintf("%.2f", payment.FoodTotal),
			"delivery_fee": fmt.Sprintf("%.2f", payment.DeliveryFee),
			"dasher_fee":   fmt.Sprintf("%.2f", payment.DasherFee),
		},
	}

	return paymentintent.New(params)
}

func CreatePaymentHandler(c *gin.Context) {
	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	payment := CalculatePayment(req.FoodTotal, req.OrderId)
	intent, err := CreatePaymentIntent(payment)

	if err != nil {
		c.JSON(500, gin.H{"error": "failed to create payment intent"})
		return
	}

	c.JSON(200, gin.H{
		"client_secret":     intent.ClientSecret,
		"payment_breakdown": payment,
	})
}
func InitKey() {

	stripeKey := os.Getenv("STRIPE_API_KEY")
	stripe.Key = stripeKey
}
