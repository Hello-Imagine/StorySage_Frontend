#!/bin/bash

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

# Build and run docker container
docker build \
  --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL \
  --build-arg VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY \
  -t vite-react-app .

# For local development (runs on port 8080)
if [ "$ENV" = "development" ]; then
    docker run -d \
      -p 8080:80 \
      --env-file $CONFIG_FILE \
      --name vite-react-container \
      vite-react-app
# For production deployment
else
    docker run -d \
      -p 80:80 \
      --env-file $CONFIG_FILE \
      --name vite-react-container \
      vite-react-app
fi 