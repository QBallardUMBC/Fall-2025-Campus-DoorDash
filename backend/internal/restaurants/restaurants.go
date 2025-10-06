// Package restaurants implements restaurant crud functionality for campus doordash application
package restaurants

import (
	"context"

	"github.com/google/uuid"
	_"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Restaurant struct {
	RestaurantID uuid.UUID `json:"restaurant_id" db:"restaurant_id"`
	RestaurantName string `json:"restaurant_name" db:"restaurant_name"`
	LocationID *uuid.UUID `json:"location_id,omitempty" db:"location_id"`
}

type FoodItem struct{
	FoodID uuid.UUID `json:"food_id" db:"food_id"`
	RestaurantID  *uuid.UUID `json:"restaurant_id" db:"restaurant_id"`
	CategoryID *uuid.UUID `json:"category_id" db:"category_id"`
	FoodName string `json:"food_name" db:"food_name"`
	Price float64 `json:"price" db:"price"`
	Availability bool `json:"availability" db:"availability"`
}

type RestaurantService struct{
	conn *pgxpool.Pool
}

func NewRestaurantService(conn * pgxpool.Pool) *RestaurantService{ 
	return &RestaurantService{conn: conn}	
}

func (s* RestaurantService) GetAllRestaurants(ctx context.Context) ([]Restaurant, error){
	query := `
		SELECT restaurant_id, restaurant_name, location_id
		FROM restaurants 
		ORDER BY restaurant_name
	`

	rows, err := s.conn.Query(ctx, query)

	if err != nil{
		return nil, err
	}
	
	defer rows.Close()
	
	var restaurants []Restaurant
	
	for rows.Next(){
		var r Restaurant
		//insert into r
		//get all those values from row and put into r
		err := rows.Scan(&r.RestaurantID, &r.RestaurantName, &r.LocationID)
		if err != nil{
			return nil, err
		}

		restaurants = append(restaurants, r)
	}

	return restaurants, nil
}

func (s *RestaurantService) GetRestaurantsByID(ctx context.Context, restaurantID uuid.UUID) (*Restaurant, error){
	query := `
		SELECT restaurant_id, restaurant_name, location_id
		FROM restaurants 
		WHERE restaurant_id = $1
	`
	var r Restaurant
	err := s.conn.QueryRow(ctx, query, restaurantID).Scan(
		&r.RestaurantID, &r.RestaurantName, &r.LocationID,	
	)

	if err != nil{
		return nil, err	
	}
		
	return &r, nil
}

func (s * RestaurantService) GetRestaurantMenu (ctx context.Context, restaurantID uuid.UUID)([]FoodItem, error){
	var foodItems []FoodItem
	query := `
	SELECT food_id, restaurant_id, category_id, food_name, price, availability 
	FROM food 
	WHERE restaurant_id = $1 AND availability = true 
	ORDER BY food_name
	`
	rows, err := s.conn.Query(ctx, query, restaurantID,)

	if err != nil{
		return nil, err
	}
	
	defer rows.Close()
	for rows.Next(){
		var item FoodItem
		err := rows.Scan(&item.FoodID, &item.RestaurantID, &item.CategoryID, &item.FoodName, &item.Price, &item.Availability,)

		if err != nil{
			return nil, err				
		}

		foodItems= append(foodItems, item) 
	}

	return foodItems, nil
}

func (s * RestaurantService) GetFoodItemByID(ctx context.Context, foodId uuid.UUID) (*FoodItem, error){
	var item FoodItem
	query := `
	SELECT food_id, restaurant_id, category_id, food_name, price, availability
	FROM food 
	WHERE food_id = $1
	`
	//queryrow queries only one row query queries the whole table
	err := s.conn.QueryRow(ctx, query, foodId,).Scan( 
		&item.FoodID, &item.RestaurantID, &item.CategoryID, 
		&item.FoodName, &item.Price, &item.Availability, 
	)
	
	if err != nil{
		return nil, err
	}

	return &item, err
}

