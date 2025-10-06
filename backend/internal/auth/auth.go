// Package auth package for authentication
package auth

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
_	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/supabase-community/gotrue-go/types"
	"github.com/supabase-community/supabase-go"
)

var Conn * pgxpool.Pool
var supabaseClient *supabase.Client

type AuthRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func RefreshTokenHandler(c *gin.Context) {
	type RefreshRequest struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	//parse request body
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "refresh_token is required",
			"details": err.Error(),
		})
		return
	}

	tokenResp, err := supabaseClient.Auth.RefreshToken(req.RefreshToken)
	if err != nil {
		log.Printf("token refresh failed %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "invalid or expired refresh token",
			"message": "please ;lofgin again",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Token refreshed successfully",
		"access_token":  tokenResp.AccessToken,
		"refresh_token": tokenResp.RefreshToken,
		"expires_in":    tokenResp.ExpiresIn,
		"token_type":    tokenResp.TokenType,
	})
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		//check if there is a header
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "no authorization header provided",
			})

			c.Abort()
			return
		}
		//check if token is of bearer kind
		if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "invalid authorization format. Use 'Beared <token>'",
			})
			c.Abort()
			return
		}
		//verify token
		token := authHeader[7:]
		authedClient := supabaseClient.Auth.WithToken(token)
		userResp, err := authedClient.GetUser()
		if err != nil || userResp == nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "invalid or expired token",
			})
			c.Abort()
			return
		}
		c.Set("user", userResp.User)
		c.Set("user_id", userResp.ID)
		c.Next()
	}
}
func AuthHandler(c *gin.Context) {
	log.Println("Connecting to db")
	InitDB()
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
		"message":       "login good",
		"user":          user,
		"access token":  user.AccessToken,
		"refresh_token": user.RefreshToken,
		"expires_in":    user.ExpiresIn,
	})
}

func RegisterHandler(c *gin.Context) {
	var req AuthRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var err error
	id := uuid.New()
	log.Println(id)
	_, err = Conn.Exec(context.Background(), "INSERT INTO users (email,user_id) VALUES ($1,$2)", req.Email, id)
	if err != nil {
		log.Fatal("db insert failed", err)
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
		log.Fatal("failed to Connect to supabase client", err)
	}
	log.Println("supabase client initialized")
}

func InitDB() {
	ConnStr := os.Getenv("DB_STRING")

	var err error
	Conn, err = pgxpool.New(context.Background(), ConnStr)
	if err != nil {
		log.Fatal("failed to Connect to database", err)
	}

	var version string
	if err := Conn.QueryRow(context.Background(), "SELECT version()").Scan(&version); err != nil {
		log.Fatal("Query failed:", err)
	}

	log.Println("Connected to database!")
}
