# Stage  1: Build the React application
FROM node:lts-alpine AS build-react

RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY ./web ./
RUN pnpm install
RUN pnpm run build

# Stage  2: Build the Go application
FROM golang:1.24-alpine AS build-go
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

# Copy the React build output from the build-react stage
COPY --from=build-react /app/dist /app/web/dist

COPY .env*.yml ./

# Start the Go server
CMD ["./main"]
