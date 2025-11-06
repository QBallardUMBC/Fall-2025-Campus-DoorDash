// Package orders is meant for order creation and management system
package orders

import (
	"campusDoordash/internal/payments"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrderStatus string

const(

	StatusPending 					OrderStatus = "pending" 
	StatusConfirmed					OrderStatus = "confirmed" 
	StatusPreparing 				OrderStatus = "preparing" 
	StatusReady						OrderStatus = "ready" 
	StatusPickedUp					OrderStatus = "picked_up"
	StatusDelivered 				OrderStatus = "delivered" 
	StatusCancelled 				OrderStatus = "cancelled"

)

type OrderItem struct{
	FoodID 		uuid.UUID 		`json:"food_id"`
	Quantity 	int				`json:"quantity"`
	Price 		float64			`json:"price"`
	FoodName 	string			`json:"food_name,omitempty"`
}

type Order struct{
	ID						uuid.UUID 					`json:"id" db:"id"`
	CreatedAt 				time.Time 					`json:"created_at" db:"created_at"`
	CustomerID           	uuid.UUID    				`json:"customer_id" db:"customer_id"`
	RestaurantID         	uuid.UUID    				`json:"restaurant_id" db:"restaurant_id"`
	DasherID             	*uuid.UUID   				`json:"dasher_id,omitempty" db:"dasher_id"`
	OrderItems 				[]OrderItem 				`json:"order_items" db:"order_items"`	
	Subtotal             	float64      				`json:"subtotal" db:"subtotal"`
	DeliveryFee          	float64      				`json:"delivery_fee" db:"delivery_fee"`
	DasherFee            	float64      				`json:"dasher_fee" db:"dasher_fee"`
	Total                	float64      				`json:"total" db:"total"`
	Status					OrderStatus  				`json:"status" db:"status"`
	DeliveryAddress 		string						`json:"delivery_address" db:"delivery_address"`
	DeliveryInstructions	*string 					`json:"delivery_instructions,omitempty" db:"delivery_instructions"`
	PaymentIntentID      	*string      				`json:"payment_intent_id,omitempty" db:"payment_intent_id"`
	UpdatedAt            	time.Time    				`json:"updated_at" db:"updated_at"`
	ConfirmedAt          	*time.Time   				`json:"confirmed_at,omitempty" db:"confirmed_at"`
	ReadyAt              	*time.Time   				`json:"ready_at,omitempty" db:"ready_at"`
	PickedUpAt           	*time.Time   				`json:"picked_up_at,omitempty" db:"picked_at"`
	DeliveredAt          	*time.Time   				`json:"delivered_at,omitempty" db:"delivered_at"`
}

type CreateOrderRequest struct{
	CustomerID 				uuid.UUID 		`json:"customer_id" binding:"required"`
	RestaurantID 			uuid.UUID 		`json:"restaurant_id" binding:"required"`
	OrderItems				[]OrderItem 	`json:"order_items" binding:"required"`
	DeliveryAddress 		string 			`json:"delivery_address" binding:"required"`
	DeliveryInstructions 	*string			`json:"delivery_instructions,omitempty"`	
}

type OrderService struct{
	conn * pgxpool.Pool
}

func NewOrderService(conn *pgxpool.Pool) *OrderService{
	return &OrderService{conn}	
}

func (s * OrderService) CreateOrder(ctx context.Context, req CreateOrderRequest)(*Order, string, error){

	orderID := uuid.New()
	subtotal := calculateSubtotal(req.OrderItems)
	deliveryFee := 3.99
	dasherFee := 2.00
	total :=  subtotal + deliveryFee + dasherFee
	payment := payments.CalculatePayment(total, orderID.String())
	intent, err := payments.CreatePaymentIntent(payment)

	if err != nil{
		return nil, "empty secret",fmt.Errorf("failed to create payment intent %v", err)	
	}
	paymentIntentID := intent.ID 
	log.Println(paymentIntentID)	
	orderItemsJSON, err := json.Marshal(req.OrderItems)
	
	
	if err != nil{
		return nil, "empty secret", fmt.Errorf("failed to marshal order items: %v", err)
	}
	query := `
		INSERT INTO public.orders(
			id, customer_id, restaurant_id, order_items, 
			subtotal, delivery_fee, dasher_fee, total, 
			status, delivery_address, delivery_instructions,
			payment_intent_id, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		) 

		RETURNING id, created_at, customer_id, restaurant_id, dasher_id,
			order_items, subtotal, delivery_fee, dasher_fee, total, 
			status, delivery_address, delivery_instructions, 
			payment_intent_id, updated_at, confirmed_at, ready_at, 
			picked_at, delivered_at
	`

	now := time.Now()
	
	var order Order 
	err = s.conn.QueryRow(ctx, query,
		orderID, 
		req.CustomerID, 
		req.RestaurantID, 
		orderItemsJSON, 
		subtotal, 
		deliveryFee, 
		dasherFee, 
		total, 
		StatusPending, 
		req.DeliveryAddress, 
		req.DeliveryInstructions, 
		paymentIntentID,
		now, 
		now, 
	).Scan(
		&order.ID, 
		&order.CreatedAt, 
		&order.CustomerID, 
		&order.RestaurantID,
		&order.DasherID,
		&order.OrderItems,
		&order.Subtotal,
		&order.DeliveryFee,
		&order.DasherFee,
		&order.Total,
		&order.Status,
		&order.DeliveryAddress,
		&order.DeliveryInstructions,
		&order.PaymentIntentID,
		&order.UpdatedAt,
		&order.ConfirmedAt,
		&order.ReadyAt,
		&order.PickedUpAt,
		&order.DeliveredAt,	
	)

	if err != nil{
		return nil, "empty secret", err
	}
	
	fmt.Println("Payment Intent created:", paymentIntentID)
	order.PaymentIntentID = &paymentIntentID

	return &order, intent.ClientSecret, nil
}

func (s * OrderService) GetOrderByID(ctx context.Context, orderID uuid.UUID) (*Order, error){
	query := `
		SELECT id, created_at, customer_id, restaurant_id, dasher_id,
			order_items, subtotal, delivery_fee, dasher_fee, total, 
			status, delivery_address, delivery_instructions,
			payment_intent_id, updated_at, confirmed_at, ready_at, 
			picked_at, delivered_at
		FROM orders 
		WHERE id = $1
	`
	var order Order
	err := s.conn.QueryRow(ctx, query, orderID).Scan(
		&order.ID,
		&order.CreatedAt,
		&order.CustomerID,
		&order.RestaurantID,
		&order.DasherID,
		&order.OrderItems,
		&order.Subtotal,
		&order.DeliveryFee,
		&order.DasherFee,
		&order.Total,
		&order.Status,
		&order.DeliveryAddress,
		&order.DeliveryInstructions,
		&order.PaymentIntentID,
		&order.UpdatedAt,
		&order.ConfirmedAt,
		&order.ReadyAt,
		&order.PickedUpAt,
		&order.DeliveredAt,		
	)

	if err != nil{
		return nil , err
	}
	return &order, nil
}

func (s * OrderService) GetOrdersByCustomerID(ctx context.Context, customerID uuid.UUID)([]Order, error){
	query := `
		SELECT id, created_at, customer_id, restaurant_id, dasher_id, 
			order_items, subtotal, delivery_fee, dasher_fee, total, 
			status, delivery_address, delivery_instructions, 
			payment_intent_id, updated_at, confirmed_at, ready_at,
			picked_at, delivered_at 
		FROM orders 
		WHERE customer_id = $1
		ORDER BY created_at DESC
	`
	rows, err := s.conn.Query(ctx, query, customerID)
	if err != nil{
		return nil, err	
	}
	defer rows.Close()

	var orders []Order
	for rows.Next(){
		var order Order
		err := rows.Scan(
			&order.ID,
			&order.CreatedAt,
			&order.CustomerID,
			&order.RestaurantID,
			&order.DasherID,
			&order.OrderItems,
			&order.Subtotal,
			&order.DeliveryFee,
			&order.DasherFee,
			&order.Total,
			&order.Status,
			&order.DeliveryAddress,
			&order.DeliveryInstructions,
			&order.PaymentIntentID,
			&order.UpdatedAt,
			&order.ConfirmedAt,
			&order.ReadyAt,
			&order.PickedUpAt,
			&order.DeliveredAt,
		)

		if err != nil{
			return nil, err
		}
		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil{
		return nil, err	
	}

	return orders, nil
}
func (s * OrderService) GetOrderByRestaurantID(ctx context.Context, restaurantID uuid.UUID)([]Order, error){
	query := `
		SELECT id, created_at, customer_id, restaurant_id, dasher_id, 
			order_items, subtotal, delivery_fee, dasher_fee, total, 
			status, delivery_address, delivery_instructions, payment_intent_id,
			updated_at, confirmed_at, ready_at, picked_at, delivered_at
		FROM orders 
		WHERE restaurant_id = $1
		ORDER BY created_at DESC
	`

	rows, err := s.conn.Query(ctx, query, restaurantID)

	if err != nil {
		return nil, err
	}
	
	var orders []Order

	for rows.Next(){
		var order Order
		err := rows.Scan(
			&order.ID,
			&order.CreatedAt,
			&order.CustomerID,
			&order.RestaurantID,
			&order.DasherID,
			&order.OrderItems,
			&order.Subtotal,
			&order.DeliveryFee,
			&order.DasherFee,
			&order.Total,
			&order.Status,
			&order.DeliveryAddress,
			&order.DeliveryInstructions,
			&order.PaymentIntentID,
			&order.UpdatedAt,
			&order.ConfirmedAt,
			&order.ReadyAt,
			&order.PickedUpAt,
			&order.DeliveredAt,
		)

		if err != nil{
			return nil, err
		}
		orders = append(orders, order)
	}
		
	if err := rows.Err(); err != nil{
		return nil, err
	}
	return orders , nil
}

func (s * OrderService) UpdateOrderStatus(ctx context.Context, orderID uuid.UUID, status OrderStatus) error{
	now := time.Now()
	
 	timestampColumn := map[OrderStatus]string{
		StatusConfirmed: "confirmed_at",
		StatusReady: "ready_at", 
		StatusPickedUp: "picked_at",
		StatusDelivered: "delivered_at",
	}	
	
	if col, ok := timestampColumn[status]; ok{
		query := fmt.Sprintf(`	
			UPDATE orders 
			SET status = $1, %s = $2, updated_at = $3
			WHERE id = $4 
		`, col)	

		_, err := s.conn.Exec(ctx, query, status, now, now, orderID)

		if err != nil{
			return err
		}
	}

	query := `
		UPDATE orders 
		SET status = $1, updated_at = $2
		WHERE id = $3
	`
	_,err := s.conn.Exec(ctx, query, status, now, orderID)

	
	return err
}

func (s * OrderService) AssignDasher(ctx context.Context, orderID uuid.UUID, dasherID uuid.UUID) error{	
	query := `
		UPDATE orders 
		SET dasher_id = $1, updated_at = $2 
		WHERE id = $3 
	`

	_, err := s.conn.Exec(ctx, query, dasherID, time.Now(), orderID)
	return err
}

func calculateSubtotal(items [] OrderItem) float64{
	var subtotal float64

	for _,item := range items{
		if item .Price == 0{
			item.Price = 1.0	
		}
		subtotal += item.Price * float64(item.Quantity)
	}

	return subtotal
}
