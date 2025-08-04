#!/bin/bash

# Build Docker image for Playwright tests
set -e

echo "Building Playwright Docker image..."

# Build the image
docker build -t playwright-typescript:latest .

echo "Docker image built successfully!"
echo "Run tests with: docker run --rm playwright-typescript:latest"