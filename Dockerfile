# Stage  1: Build the Web application
FROM oven/bun:1 AS build-web

WORKDIR /app

ENV NODE_ENV=production

COPY ./web ./
RUN bun install --frozen-lockfile
RUN bun run build

# Stage  2: Build the Go application
FROM golang:1.26-alpine AS build-go
WORKDIR /app
COPY ./app ./app
COPY ./go.* ./
COPY ./main.go ./

RUN go build -o "main"

# Stage  3: Setup the final image
FROM gcr.io/distroless/static-debian12
WORKDIR /app

# Copy the Go binary from the build-go stage
COPY --from=build-go /app/main /app/

# Copy the Web build output from the build-web stage
COPY --from=build-web /app/dist /app/web/dist

COPY .env*.yml ./

# Start the Go server
CMD ["./main"]
