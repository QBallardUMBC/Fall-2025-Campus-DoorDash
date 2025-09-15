package auth

import (
	"context"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
	"log"
	"net/http"
	"os"
)

var conn *pgx.Conn
var supabaseClient *supabase.Client

type AuthRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func AuthHandler(c *gin.Context) {
	log.Println("connecting to db")
	initDb()
	SetupAuthClient()
}

func LoginHandler(c *gin.Context) {
	var req AuthRequest
	//you have to bind json inline
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := supabaseClient.Auth.SignInWithEmailPassword(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "login good",
		"user":         user,
		"access token": user.AccessToken,
	})
}

func RegisterHandler(c *gin.Context) {
	var req AuthRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	signupReq := types.SignupRequest{
		Email:    req.Email,
		Password: req.Password,
	}

	user, err := supabaseClient.Auth.Signup(signupReq)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "user created successfulty",
		"user":    user,
	})
}

func SetupAuthClient() {
	var err error
	supabaseClient, err = supabase.NewClient(
		os.Getenv("DB_URL"),
		os.Getenv("DB_API_KEY"),
		&supabase.ClientOptions{},
	)

	if err != nil {
		log.Fatal("failed to connect to supabase client", err)
	}
	log.Println("supabase client initialized")
}

func initDb() {
	connStr := os.Getenv("DB_STRING")

	var err error
	conn, err = pgx.Connect(context.Background(), connStr)
	if err != nil {
		log.Fatal("failed to connect to database", err)
	}

	var version string
	if err := conn.QueryRow(context.Background(), "SELECT version()").Scan(&version); err != nil {
		log.Fatal("Query failed:", err)
	}

	log.Println("connected to database!")
}
