#!/bin/bash

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running or you don't have permissions."
    echo "Try running: sudo systemctl start docker"
    echo "And: sudo usermod -aG docker $USER"
    exit 1
fi

# Check environment
ENV=${1:-production}  # Default to production if not specified
CONFIG_FILE=".env.${ENV}"

# Verify environment file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file $CONFIG_FILE not found!"
    exit 1
fi

# Load environment variables from the config file
export $(cat $CONFIG_FILE | grep -v '^#' | xargs)

echo "Building for ${ENV} environment..."

# Build and run docker container
docker build \
  --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL \
  --build-arg VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY \
  -t vite-react-app .

# Check if container already exists
if docker ps -a | grep -q vite-react-container; then
    echo "Stopping and removing existing container..."
    docker stop vite-react-container
    docker rm vite-react-container
fi

# For local development (runs on port 8080)
if [ "$ENV" = "development" ]; then
    echo "Starting container in development mode on port 8080..."
    docker run -d \
      -p 8080:80 \
      -e VITE_API_BASE_URL=$VITE_API_BASE_URL \
      --name vite-react-container \
      vite-react-app
# For production deployment
else
    echo "Starting container in production mode on port 80..."
    docker run -d \
      -p 80:80 \
      -e VITE_API_BASE_URL=$VITE_API_BASE_URL \
      --name vite-react-container \
      vite-react-app
fi

# Verify container is running
sleep 2  # Wait for container to start
if ! docker ps | grep -q vite-react-container; then
    echo "Error: Container failed to start. Checking logs..."
    docker logs vite-react-container
    exit 1
fi

echo "Deployment completed successfully!"
echo "Container is running on port $([ "$ENV" = "development" ] && echo "8080" || echo "80")"
echo "Container logs:"
docker logs vite-react-container 