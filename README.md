# Playwright TypeScript Test Automation Framework

A comprehensive test automation framework built with Playwright and TypeScript for both API and UI testing.

## Features

- **API Testing** - RESTful API test automation with custom services
- **UI Testing** - End-to-end browser automation with page object model  
- **Data Management** - Factory pattern for test data generation
- **Configuration** - Environment-based configuration management
- **Reporting** - Built-in HTML reports and test artifacts

## Project Structure

```
├── api-tests/          # API test specifications
├── ui-tests/           # UI test specifications
├── pages/              # Page object models
├── core/
│   ├── api/           # API client and services
│   ├── data/          # Data factories and models
│   ├── fixtures/      # Custom test fixtures
│   └── models/        # TypeScript interfaces
├── config/            # Environment configurations
└── playwright.config.ts
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Run tests:
```bash
# All tests
npm test

# API tests only
npx playwright test api-tests/

# UI tests only
npx playwright test ui-tests/
```

## Test Reports

View test results:
```bash
npx playwright show-report
```

## Docker Support

Run tests in containerized environment:

```bash
# Build Docker image
./scripts/docker-build.sh

# Run all tests
./scripts/docker-run.sh

# Run specific test types
./scripts/docker-run.sh --type api
./scripts/docker-run.sh --type ui

# Run with Docker Compose
docker-compose run --rm playwright-tests
```

## Configuration

Environment settings are managed in `config/environment.json`. Update base URLs and credentials as needed for different environments.
