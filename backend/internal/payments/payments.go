// Package payments is used for establishing payments in order
package payments

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/paymentintent"
	"github.com/stripe/stripe-go/v82/webhook"
)

type OrderPayment struct {
	OrderID          string  `json:"order_id"`
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
	OrderID   string  `json:"order_id" binding:"required"`
}

type PaymentService struct{
	Conn * pgxpool.Pool	
}

func CalculatePayment(foodTotal float64, orderID string) OrderPayment {
	deliveryFee := foodTotal * 0.05 //5 percent delivery fee
	dasherFee := 3.00               //dashers will always make base 3 dollars
	customerTotal := deliveryFee + dasherFee + foodTotal
	return OrderPayment{
		OrderID:          orderID, // Was missing
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
			"order_id":     payment.OrderID,
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

	payment := CalculatePayment(req.FoodTotal, req.OrderID)
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

func (s * PaymentService) StripeWebhookHandle() gin.HandlerFunc{
	return func(c * gin.Context){
		payload, _ := io.ReadAll(c.Request.Body)
		event, err := webhook.ConstructEvent(
			payload, 
			c.GetHeader("Stripe-Signature"), 
			os.Getenv("STRIPE_WEBHOOK_SECRET"),
		)

		if err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid signature"})
			return
		}
		
		if event.Type == "payment_intent.succeeded"{
			var pi stripe.PaymentIntent
			_ = json.Unmarshal(event.Data.Raw, &pi)
			fmt.Printf("Payment successful for %s\n", pi.ID)

			_, err = s.Conn.Exec(context.Background(), 
				"UPDATE orders SET status = 'confirmed', confirmed_at = NOW() WHERE payment_intent_id = $1",
				pi.ID,
			)
			
			if err != nil{
				fmt.Println("DB update error:", err)
			}

		}

		c.Status(http.StatusOK)
	}
}

func InitKey() {

	stripeKey := os.Getenv("STRIPE_API_KEY")
	stripe.Key = stripeKey
}
