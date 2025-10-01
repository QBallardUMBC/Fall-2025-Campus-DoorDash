package orders

import(
	"context"
	"encoding/json"
	"fmt"
	"time"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"campusDoordash/internal/restaurants"
)
//Order represents a customer order
type Order struct{
	ID 						uuid.UUID 		`json:"id" db:"id"`
	CreatedAt 				time.Time 		`json:"created_at" db:"created_at"`
	CustomerID 				uuid.UUID 		`json:"customer_id" db:"customer_id"`
	RestaurantID			uuid.UUID 		`json:"restaurant_id" db:"restaurant_id"`
	DasherID				uuid.UUID 		`json:"dasher_id" db:"dasher_id"`
	Items					json.RawMessage `json:"items" db:"order_items"`
	Subtotal				float64	 		`json:"subtotal" db:"subtotal"`
	DeliveryFee 			float64         `json:"delivery_fee" db:"delivery_fee"`
	DasherFee				float64         `json:"dasher_fee" db:"dasher_fee"`
	Total           		float64     	`json:"total" db:"total"`
	Status          		string          `json:"status" db:"status"`
	DeliveryAddress  		string         	`json:"delivery_address" db:"delivery_address"`
	DeliveryInstructions 	string     		`json:"delivery_instructions,omitempty" db:"delivery_instructions"`
	PaymentIntentID      	string          `json:"payment_intent_id,omitempty" db:"payment_intent_id"`
	UpdatedAt            	time.Time       `json:"updated_at" db:"updated_at"`
}
//OrderItem item in an order
type OrderItem struct{
	FoodID 		string 		`json:"food_id"`
	Name		string		`json:"name"`
	Price		float64		`json:"price"`
	Quantity	int 		`json:"quantity"`
}
//CreateOrderRequest request payload for creating an order
type CreateOrderRequest struct{
	RestaurantID			string			`json:"restaurant_id" binding:"required"`
	Items					[]OrderItem 	`json:"items" binding:"required,min=1"`
	DeliveryAddress 		string 			`json:"delivery_address" binding:"required"`
	DeliveryInstructions	string 			`json:"delivery_instructions"`
}
//UpdateStatusRequest request
type UpdateStatusRequest struct{
	Status string `json:"status" binding:"required"`
}

type OrderService struct{
	conn				*pgx.Conn
	restarantService	*restaurants.RestaurantService 
}

func NewOrderService(conn * pgx.Conn, restaurantService * restaurants.RestaurantService)(*OrderService){
	return &OrderService{
		conn: conn, 
		restarantService:  restaurantService,
	}
}

func (s * OrderService) CalculateOrderTotals(subtotal float64) (deliveryFee, dasherFee, total float64){
	deliveryFee = subtotal * 0.05 // 5 percent delivery fee 
	dasherFee = 3.00
	total = subtotal + deliveryFee + dasherFee
	return
}

func (s * OrderService) ValidateAndCreateOrder(ctx context.Context, customerID uuid.UUID, req CreateOrderRequest)(*Order, error){	
	restaurantID, err := uuid.Parse(req.RestaurantID)

	if err != nil{
		return nil, fmt.Errorf("invalid restaurant ID format")	
	}
	
	_,err = s.restarantService.GetRestaurantsByID(ctx, restaurantID)
	if err != nil{
		return nil, fmt.Errorf("restaurant not found")
	}

	//validate items and calculate subtotal from database prices
	var subtotal float64 
	var validatedItems []OrderItem
	for _, item := range req.Items{
		
		//return nil if there are no items being ordered
		if item.Quantity <= 0{
			return nil, fmt.Errorf("invalid quantity for item")
		}
		
		foodID, err := uuid.Parse(item.FoodID)
		
		if err != nil{
			return nil, fmt.Errorf("invalid food item ID format")
		}
		
		foodItem, err := s.restarantService.GetFoodItemByID(ctx, foodID)	
		if err != nil{
			return nil, fmt.Errorf("food item not found %s", item.FoodID)
		}
			
		//check if item belongs to specified restaurant
		if foodItem.RestaurantID == nil || *foodItem.RestaurantID != restaurantID{
			return nil, fmt.Errorf("food item does not belong to specified restaurant")
		}
		
		if !foodItem.Availability{
			return nil, fmt.Errorf("item %s is currently unavailable", foodItem.FoodName)
		}
		
		validatedItem := OrderItem{
			FoodID: item.FoodID,
			Name: foodItem.FoodName,
			Price: foodItem.Price,
			Quantity: item.Quantity,
		}

		validatedItems = append(validatedItems, validatedItem)
		subtotal += foodItem.Price * float64(item.Quantity)
	}
	
	deliveryFee, dasherFee, total := s.CalculateOrderTotals(subtotal)
	
	itemsJSON, err := json.Marshal(validatedItems) 

	if err != nil{
		return nil, fmt.Errorf("failed to marshal items %w", err)
	}
	
	order := &Order{
		ID: 					uuid.New(), 
		CustomerID: 			customerID,
		RestaurantID: 			restaurantID,
		Items: 					itemsJSON,
		Subtotal: 				subtotal,
		DeliveryFee: 			deliveryFee,
		DasherFee:				dasherFee,
		Total: 					total,
		Status: 				"pending",
		DeliveryAddress: 		req.DeliveryAddress,
		DeliveryInstructions: 	req.DeliveryInstructions,
		CreatedAt: 				time.Now(),
		UpdatedAt: 				time.Now(),
	}

	query := `
		INSERT INTO orders (
			id, customer_id, restaurant_id, items, subtotal, 
			delivery_fee, dasher_fee, total, status,
			delivery_address, delivery_instructions, created_at, updated_at
		)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`

	_, err = s.conn.Exec(ctx, query, 
		order.ID, order.CustomerID, order.RestaurantID, order.Items, 
		order.Subtotal, order.DeliveryFee, order.DasherFee, order.Total, 
		order.Status, order.DeliveryAddress, order.DeliveryInstructions, 
		order.CreatedAt, order.UpdatedAt,
	)

	if err != nil{
		return nil, fmt.Errorf("failed to create order: %w", err)	
	}

	return order, nil
}
