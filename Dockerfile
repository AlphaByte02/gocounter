# Stage  1: Build the React application
FROM node:lts-alpine AS build-react
WORKDIR /app
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

COPY ./web ./
RUN /root/.local/share/pnpm/pnpm install
RUN /root/.local/share/pnpm/pnpm run build


# Stage  2: Build the Go application
FROM golang:1.24-alpine AS build-go
WORKDIR /app
COPY ./app ./app
COPY ./go.* ./
COPY ./main.go ./

RUN go build -o "main"

# Stage  3: Setup the final image
FROM alpine:latest
WORKDIR /app

# Copy the Go binary from the build-go stage
COPY --from=build-go /app/main /app/

# Copy the React build output from the build-react stage
COPY --from=build-react /app/dist /app/web/dist

COPY .env*.yml ./

# Start the Go server
CMD ["./main"]
