package api

import (
	h "main/app/api/handlers"

	"github.com/gofiber/fiber/v3"
)

func SetRoutes(a *fiber.App) {
	route := a.Group("/api")

	route.Get("/counters", h.ListCounter)
	route.Get("/counters/:id", h.GetCounter)
	route.Get("/counters/:id/data", h.GetCounterData)
	route.Get("/counters/:id/stats", h.GetCounterStats)
	route.Post("/counters", h.CreateCounter)
	route.Patch("/counters/:id", h.UpdateCounter)
	route.Delete("/counters/:id", h.DeleteCounter)

	route.Get("/data", h.ListData)
	route.Get("/feed", h.ListDataFeed)
	route.Get("/data/:id", h.GetData)
	route.Post("/data", h.CreateData)
	route.Patch("/data/:id", h.UpdateData)
	route.Delete("/data/:id", h.DeleteData)

	route.Get("/users", h.ListUser)
	route.Get("/users/:id", h.GetUser)
	route.Post("/users", h.CreateUser)
	route.Patch("/users/:id", h.UpdateUser)
	route.Delete("/users/:id", h.DeleteUser)

}
