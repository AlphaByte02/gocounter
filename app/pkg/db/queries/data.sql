-- name: GetData :one
SELECT
    *
FROM
    DATA
WHERE
    ID = $1
LIMIT
    1;


-- name: ListData :many
SELECT
    *
FROM
    DATA
ORDER BY
    ID;


-- name: ListDataSince :many
SELECT
    *
FROM
    DATA
WHERE
    /* sql-formatter-disable */
    EXTRACT(year from RECORDED_AT) >= @from_year::int
    /* sql-formatter-enable */
ORDER BY
    ID;


-- name: ListDataFeed :many
SELECT
    *
FROM
    DATA
ORDER BY
    RECORDED_AT DESC,
    ID DESC
LIMIT
    $1
OFFSET
    $2;


-- name: DeleteData :exec
DELETE FROM DATA
WHERE
    ID = $1;


-- name: CreateData :one
INSERT INTO
    DATA (ID, COUNTER_ID, VALUE, RECORDED_AT)
VALUES
    ($1, $2, $3, $4)
RETURNING
    *;


-- name: ListDataByCounter :many
SELECT
    *
FROM
    DATA
WHERE
    COUNTER_ID = $1
ORDER BY
    ID;


-- name: ListDataByCounterSince :many
SELECT
    *
FROM
    DATA
WHERE
    COUNTER_ID = $1
    AND /* sql-formatter-disable */
    EXTRACT(year from RECORDED_AT) >= @from_year::int
    /* sql-formatter-enable */
ORDER BY
    ID;
