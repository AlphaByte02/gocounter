-- name: GetData :one
SELECT * FROM data
WHERE id = $1 LIMIT 1;

-- name: ListData :many
SELECT * FROM data
ORDER BY id;

-- name: ListDataByCounter :many
SELECT * FROM data
WHERE counter_id = $1
ORDER BY id;
