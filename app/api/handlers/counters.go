package handlers

import (
	"context"
	db "main/app/pkg/db/sqlc"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

func GetCounter(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	counterID, _ := fiber.Convert(c.Params("id"), uuid.Parse)
	counter, err := Q.GetCounter(context.Background(), counterID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(counter)
}

func GetCounterData(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	counterID, _ := fiber.Convert(c.Params("id"), uuid.Parse)
	data, err := Q.ListDataByCounter(context.Background(), counterID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(data)
}

func GetCounterStats(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	counterID, _ := fiber.Convert(c.Params("id"), uuid.Parse)
	data, err := Q.ListDataByCounter(context.Background(), counterID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(data)
}

func ListCounter(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	counters, err := Q.ListCounters(context.Background())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(counters)
}

func CreateCounter(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	body := struct {
		Name string `json:"name"`
	}{}
	err := c.Bind().Body(&body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	newCounterID, _ := uuid.NewV7()
	counter, err := Q.CreateCounter(context.Background(), db.CreateCounterParams{ID: newCounterID, Name: body.Name})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(counter)
}

func UpdateCounter(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	counterID, _ := fiber.Convert(c.Params("id"), uuid.Parse)

	body := struct {
		Name string `json:"name"`
	}{}
	c.Bind().Body(body)

	counter, err := Q.UpdateCounter(context.Background(), db.UpdateCounterParams{ID: counterID, Name: body.Name})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(counter)
}

func DeleteCounter(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	counterID, _ := fiber.Convert(c.Params("id"), uuid.Parse)
	err := Q.DeleteCounter(context.Background(), counterID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
