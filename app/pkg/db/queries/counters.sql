-- name: GetCounter :one
SELECT
  *
FROM
  counters
WHERE
  id = $1
LIMIT
  1;

-- name: ListCounters :many
SELECT
  *
FROM
  counters
ORDER BY
  id;

-- name: CreateCounter :one
INSERT INTO
  counters (id, user_id, name)
VALUES
  ($1, $2, $3)
RETURNING
  *;

-- name: UpdateCounter :one
UPDATE counters
SET
  name = $2,
  user_id = $3
WHERE
  id = $1
RETURNING
  *;

-- name: DeleteCounter :exec
DELETE FROM counters
WHERE
  id = $1;

-- name: ListCountersByUser :many
SELECT
  *
FROM
  counters
WHERE
  user_id = $1
ORDER BY
  id;

-- name: GetCounterStatsGlobal :one
WITH
  Aggr AS (
    SELECT
      SUM(VALUE)       AS total,
      MIN(recorded_at) AS first_date
    FROM
      data
    WHERE
      counter_id = $1
  ),
  TimeCalc AS (
    SELECT
      total,
      first_date,
      CEIL(
        EXTRACT(
          epoch
          FROM
            (NOW() - first_date)
        ) / 86400.0
      ) AS days
    FROM
      Aggr
    WHERE
      first_date IS NOT NULL
  )
SELECT
  ct.total,
  ct.days,
  (ct.total / NULLIF(ct.days, 1))::float AS avg
FROM
  TimeCalc ct;

-- name: GetCounterStats :one
WITH
  Aggr AS (
    SELECT
      SUM(VALUE)       AS total,
      MIN(recorded_at) AS first_date
    FROM
      data
      JOIN counters ON data.counter_id = counters.id
    WHERE
      counter_id = $1
      AND recorded_at >= counters.soft_reset
  ),
  TimeCalc AS (
    SELECT
      total,
      first_date,
      CEIL(
        EXTRACT(
          epoch
          FROM
            (NOW() - first_date)
        ) / 86400.0
      ) AS days
    FROM
      Aggr
    WHERE
      first_date IS NOT NULL
  )
SELECT
  ct.total,
  ct.days,
  (ct.total / NULLIF(ct.days, 1))::float AS avg
FROM
  TimeCalc ct;
