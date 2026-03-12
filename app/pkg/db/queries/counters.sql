-- name: GetCounter :one
SELECT
  *
FROM
  COUNTERS
WHERE
  ID = $1
LIMIT
  1;


-- name: ListCounters :many
SELECT
  *
FROM
  COUNTERS
ORDER BY
  ID;


-- name: CreateCounter :one
INSERT INTO
  COUNTERS (ID, USER_ID, NAME)
VALUES
  ($1, $2, $3)
RETURNING
  *;


-- name: UpdateCounter :one
UPDATE COUNTERS
SET
  NAME = $2,
  USER_ID = $3
WHERE
  ID = $1
RETURNING
  *;


-- name: DeleteCounter :exec
DELETE FROM COUNTERS
WHERE
  ID = $1;


-- name: ListCountersByUser :many
SELECT
  *
FROM
  COUNTERS
WHERE
  USER_ID = $1
ORDER BY
  ID;


-- name: GetCounterStats :one
WITH
  AGGR AS (
    SELECT
      SUM(VALUE) AS TOTAL,
      MIN(RECORDED_AT) AS FIRST_DATE
    FROM
      DATA
    WHERE
      COUNTER_ID = $1
  ),
  TIMECALC AS (
    SELECT
      TOTAL,
      FIRST_DATE,
      CEIL(
        EXTRACT(
          EPOCH
          FROM
            (NOW() - FIRST_DATE)
        ) / 86400.0
      ) AS DAYS
    FROM
      AGGR
    WHERE
      FIRST_DATE IS NOT NULL
  )
SELECT
  CT.TOTAL,
  CT.DAYS,
  (CT.TOTAL / COALESCE(CT.DAYS, 1))::float AS AVG
FROM
  TIMECALC CT;


-- name: GetCounterStatsSince :one
WITH
  AGGR AS (
    SELECT
      SUM(VALUE) AS TOTAL,
      MIN(RECORDED_AT) AS FIRST_DATE
    FROM
      DATA
    WHERE
      COUNTER_ID = $1
      AND /* sql-formatter-disable */
      EXTRACT(year from RECORDED_AT) >= @from_year::int
      /* sql-formatter-enable */
  ),
  TIMECALC AS (
    SELECT
      TOTAL,
      FIRST_DATE,
      CEIL(
        EXTRACT(
          EPOCH
          FROM
            (NOW() - FIRST_DATE)
        ) / 86400.0
      ) AS DAYS
    FROM
      AGGR
    WHERE
      FIRST_DATE IS NOT NULL
  )
SELECT
  CT.TOTAL,
  CT.DAYS,
  (CT.TOTAL / COALESCE(CT.DAYS, 1))::float AS AVG
FROM
  TIMECALC CT;
