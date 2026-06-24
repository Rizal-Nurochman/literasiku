# Stage 1: Build the Go application

FROM golang:1.25-alpine AS build

WORKDIR /app

# Cache Go module downloads
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Copy source and build
COPY . .

# Build a statically linked binary
# CGO_ENABLED=0 removes C library dependencies
# -ldflags strips debug info for a smaller binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w" \
    -o /app/server .

# Stage 2: Minimal production image
FROM scratch

# CA certificates for outbound HTTPS calls
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the binary
COPY --from=build /app/server /server

EXPOSE 8080

ENTRYPOINT ["/server"]