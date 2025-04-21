-- name: GetGroup :one
SELECT * FROM groups
WHERE id = $1 LIMIT 1;

-- name: ListGroups :many
SELECT * FROM groups
ORDER BY id;
