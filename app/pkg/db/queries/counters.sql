-- name: GetCounter :one
SELECT * FROM counters
WHERE id = $1 LIMIT 1;

-- name: ListCounters :many
SELECT * FROM counters
ORDER BY id;

-- name: CreateCounter :one
INSERT INTO counters (
  id, user_id, name
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: UpdateCounter :one
UPDATE counters SET name = $2, user_id = $3 WHERE id = $1 RETURNING *;

-- name: DeleteCounter :exec
DELETE FROM counters WHERE id = $1;

-- name: ListCountersByUser :many
SELECT * FROM counters
WHERE user_id = $1
ORDER BY id;


-- name: GetCounterStats :one
SELECT
    counter_id,
    SUM(value) AS total,
    MIN(recorded_at) AS firstDate,
    MAX(recorded_at) AS lastDate
FROM
    data
WHERE
    counter_id = $1
    AND recorded_at >= $2
GROUP BY
    counter_id;
