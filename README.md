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

## Redis Test Data Pools

Pre-seeded test data pools for parallel test execution without data conflicts.

### Setup

```bash
# Start Redis
docker compose up -d redis

# Seed pools
npm run pool:seed
```

### How It Works

| Pool | Purpose | Pattern |
|------|---------|---------|
| `users:fresh` | Signup tests | Consume (one-time use) |
| `users:registered` | Login/checkout tests | Acquire/Release (reusable) |

### Commands

```bash
npm run pool:seed      # Refill pools when low
npm run pool:status    # Check pool levels
npm run pool:cleanup   # Recover stale data
```

### Usage in Tests

```typescript
// Signup test - user consumed, not returned
const user = await pool.consumeFreshUser();

// Login test - user borrowed, auto-returned after test
const user = await pool.acquireRegisteredUser();
```

Falls back to API-based data creation if Redis unavailable.

## Docker Support

Run tests in containerized environment:

```bash
# Start Redis + run all tests
docker compose up -d redis
docker compose run --rm playwright-tests

# Run specific test types
docker compose run --rm playwright-api-tests
docker compose run --rm playwright-ui-tests

# Run headed (with display)
docker compose run --rm playwright-headed
```

## Configuration

Environment settings are managed in `config/environment.json`. Update base URLs and credentials as needed for different environments.
