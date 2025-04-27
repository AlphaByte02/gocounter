package handlers

import (
	db "main/app/pkg/db/sqlc"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

func GetData(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	dataID, _ := fiber.Convert(c.Params("id"), uuid.Parse)
	data, err := Q.GetData(c.Context(), dataID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(data)
}

func ListData(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	data, err := Q.ListData(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(data)
}

func ListDataFeed(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	data, err := Q.ListDataFeed(c.Context(), db.ListDataFeedParams{Limit: 200, Offset: 0})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(data)
}

func CreateData(c fiber.Ctx) error {
	Q := c.Context().Value("db").(*db.Queries)

	var body db.CreateDataParams
	err := c.Bind().Body(&body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	body.ID, _ = uuid.NewV7()
	counter, err := Q.CreateData(c.Context(), body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	return c.JSON(counter)
}

func UpdateData(c fiber.Ctx) error {
	return nil
}

func DeleteData(c fiber.Ctx) error {
	return nil
}
