package handlers

import (
	db "main/app/pkg/db/sqlc"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
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

	fromYear := fiber.Query(c, "from", 0)

	if fromYear != 0 {
		data, err := Q.ListDataSince(c.Context(), int32(fromYear))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": true,
				"msg":   err.Error(),
			})
		}

		return c.JSON(data)
	}

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
	if !body.RecordedAt.Valid {
		defaultRecordedAt := pgtype.Timestamptz{}
		defaultRecordedAt.Scan(time.Now())

		body.RecordedAt = defaultRecordedAt
	}
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

// fiber:context-methods migrated
