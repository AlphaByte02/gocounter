-- name: GetGroup :one
SELECT
    *
FROM
    GROUPS
WHERE
    ID = $1
LIMIT
    1;


-- name: ListGroups :many
SELECT
    *
FROM
    GROUPS
ORDER BY
    ID;
