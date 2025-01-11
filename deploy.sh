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

# Set image and container names based on environment
IMAGE_NAME="ai-friend-frontend"
CONTAINER_NAME="ai-friend-frontend"

if [ "$ENV" = "development" ]; then
    IMAGE_NAME="${IMAGE_NAME}-dev"
    CONTAINER_NAME="${CONTAINER_NAME}-dev"
fi

echo "Building for ${ENV} environment..."

# Build and run docker container
docker build \
  --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL \
  --build-arg VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY \
  -t ${IMAGE_NAME}:latest .

# Create a Docker network if it doesn't exist
if ! docker network ls | grep -q ai-friend-network; then
    echo "Creating Docker network..."
    docker network create ai-friend-network
fi

# Check if container already exists
if docker ps -a | grep -q ${CONTAINER_NAME}; then
    echo "Stopping and removing existing container..."
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
fi

# For local development (runs on port 8080)
if [ "$ENV" = "development" ]; then
    echo "Starting container in development mode on port 8080..."
    docker run -d \
      -p 8080:80 \
      -e VITE_API_BASE_URL=$VITE_API_BASE_URL \
      --network ai-friend-network \
      --name ${CONTAINER_NAME} \
      ${IMAGE_NAME}:latest
# For production deployment
else
    echo "Starting container in production mode on port 80..."
    docker run -d \
      -p 80:80 \
      -e VITE_API_BASE_URL=$VITE_API_BASE_URL \
      --network ai-friend-network \
      --name ${CONTAINER_NAME} \
      ${IMAGE_NAME}:latest

    # Ensure backend is in the network
    if ! docker network inspect ai-friend-network | grep -q "ai-friend-backend"; then
        echo "Connecting backend to network..."
        docker network connect ai-friend-network ai-friend-backend
    fi
fi

# Verify container is running
sleep 2  # Wait for container to start
if ! docker ps | grep -q ${CONTAINER_NAME}; then
    echo "Error: Container failed to start. Checking logs..."
    docker logs ${CONTAINER_NAME}
    exit 1
fi

echo "Deployment completed successfully!"
echo "Container is running on port $([ "$ENV" = "development" ] && echo "8080" || echo "80")"
echo "Container logs:"
docker logs ${CONTAINER_NAME}