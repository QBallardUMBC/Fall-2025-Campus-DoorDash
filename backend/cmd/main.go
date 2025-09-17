package main

import (
	"campusDoordash/internal/auth"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"log"
	_ "net/http"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("error loading env file")
	}
	auth.InitDb()
	auth.SetupAuthClient()
	router := gin.Default()
	router.GET("/auth", auth.AuthHandler)
	router.POST("/auth/register", auth.RegisterHandler)
	router.POST("/auth/login", auth.LoginHandler)
	router.Run(":8080")
}
