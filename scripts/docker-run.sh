#!/bin/bash

# Docker run script for Playwright tests
set -e

echo "Running Playwright tests in Docker..."

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -t, --type       Test type: all, api, ui (default: all)"
    echo "  -h, --headed     Run in headed mode"
    echo "  -b, --build      Force rebuild Docker image"
    echo "  -c, --clean      Clean up containers and volumes"
    echo "  --help           Show this help message"
    exit 1
}

# Default values
TEST_TYPE="all"
HEADED=false
BUILD=false
CLEAN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -h|--headed)
            HEADED=true
            shift
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        --help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Clean up function
cleanup() {
    echo "Cleaning up Docker containers and volumes..."
    docker-compose down -v
    docker system prune -f
    echo "Cleanup completed"
    exit 0
}

# Handle cleanup option
if [ "$CLEAN" = true ]; then
    cleanup
fi

# Build Docker image if requested
if [ "$BUILD" = true ]; then
    echo "Building Docker image..."
    docker-compose build --no-cache
fi

# Create directories for test results
mkdir -p test-results playwright-report

# Run tests based on type
case $TEST_TYPE in
    all)
        if [ "$HEADED" = true ]; then
            echo "Running all tests in headed mode..."
            docker-compose run --rm playwright-headed
        else
            echo "Running all tests..."
            docker-compose run --rm playwright-tests
        fi
        ;;
    api)
        echo "Running API tests..."
        docker-compose run --rm playwright-api-tests
        ;;
    ui)
        echo "Running UI tests..."
        docker-compose run --rm playwright-ui-tests
        ;;
    *)
        echo "Invalid test type: $TEST_TYPE"
        echo "Valid options: all, api, ui"
        exit 1
        ;;
esac

echo "Tests completed! Check test-results/ and playwright-report/ for results."