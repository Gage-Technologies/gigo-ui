# Use the official Golang image to create a build artifact.
FROM golang:1.21 as builder

# Set the working directory inside the container.
WORKDIR /src

# Copy go.mod and go.sum files to the workspace.
COPY go.mod ./

# Copy the source code into the container.
COPY *.go ./

# Download dependencies.
RUN go get mitm-dev

# Build the Go app.
RUN CGO_ENABLED=0 GOOS=linux go build -o /mitm_server

# Use a minimal image for the runtime.
FROM alpine:latest

# Copy the compiled Go binary into the runtime container.
COPY --from=builder /mitm_server /mitm_server

# Set the working directory.
WORKDIR /

# Run the MITM server.
CMD ["/mitm_server"]