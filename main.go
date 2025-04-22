package main

import (
	"context"
	"errors"
	"log"
	"main/app/api"
	. "main/app/pkg/configs"
	db "main/app/pkg/db/sqlc"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/static"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	InitConfigs()

	DB_URI := Configs.String("db.uri")
	if DB_URI == "" {
		panic(errors.New("'db.uri' may not be empty"))
	}
	config, err := pgxpool.ParseConfig(DB_URI)
	if err != nil {
		log.Fatalf("Impossibile leggere il DSN: %v", err)
	}
	// config.MaxConns = int32(max(10, runtime.NumCPU() * 2))
	log.Printf("Impostazione pgxpool MaxConns a: %d", config.MaxConns)

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Impossibile creare il pool pgx: %v", err)
	}
	defer pool.Close()

	err = pool.Ping(context.Background())
	if err != nil {
		log.Fatalf("Impossibile fare il ping del database via pool: %v", err)
	}
	log.Println("Connessione al database (via pool) riuscita!")

	queries := db.New(pool)

	proxyHeader := Configs.String("general.proxyHeader")
	app := fiber.New(fiber.Config{
		ProxyHeader: proxyHeader,
	})
	app.Use(logger.New())

	app.Use(func(c fiber.Ctx) error {
		ctx := context.WithValue(c.Context(), "db", queries)
		c.SetContext(ctx)
		return c.Next()
	})

	app.Get("/ping", func(c fiber.Ctx) error {
		return c.SendString("pong")
	})

	api.SetRoutes(app)

	if Configs.String("general.env") == "production" {
		app.Get("/*", static.New("./web/dist"))
	} else {
		app.Get("/", func(c fiber.Ctx) error {
			return c.SendString("Hello, World!")
		})
	}

	PORT := Configs.String("general.port")
	if PORT == "" {
		PORT = ":8080"
	}
	if err := app.Listen(PORT); err != nil {
		log.Panicf("Oops... Server is not running! Reason: %v", err)
	}
}
