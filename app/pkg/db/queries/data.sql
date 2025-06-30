-- name: GetData :one
SELECT
    *
FROM
    DATA
WHERE
    id = $1
LIMIT
    1;

-- name: ListData :many
SELECT
    *
FROM
    DATA
ORDER BY
    id;

-- name: ListDataNoGlobal :many
WITH
    min_reset AS (
        SELECT
            MIN(soft_reset) AS value
        FROM
            counters
        WHERE
            soft_reset IS NOT NULL
    )
SELECT
    data.*
FROM
    data,
    min_reset
WHERE
    recorded_at > COALESCE(min_reset.value, to_timestamp(0))
ORDER BY
    id;

-- name: ListDataFeed :many
SELECT
    *
FROM
    DATA
ORDER BY
    recorded_at DESC,
    id DESC
LIMIT
    $1
OFFSET
    $2;

-- name: DeleteData :exec
DELETE FROM DATA
WHERE
    id = $1;

-- name: CreateData :one
INSERT INTO
    data (id, counter_id, value, recorded_at)
VALUES
    ($1, $2, $3, $4)
RETURNING
    *;

-- name: ListDataByCounter :many
SELECT
    data.*
FROM
    DATA
    JOIN counters ON data.counter_id = counters.id
WHERE
    counter_id = $1
    AND recorded_at >= counters.soft_reset
ORDER BY
    data.id;

-- name: ListDataByCounterGlobal :many
SELECT
    *
FROM
    DATA
WHERE
    counter_id = $1
ORDER BY
    id;
