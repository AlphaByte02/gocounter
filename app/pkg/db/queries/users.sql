-- name: GetUser :one
SELECT
    *
FROM
    USERS
WHERE
    ID = $1
LIMIT
    1;


-- name: ListUsers :many
SELECT
    *
FROM
    USERS
ORDER BY
    ID;
