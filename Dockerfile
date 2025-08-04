# Multi-stage build for optimized image
FROM mcr.microsoft.com/playwright:v1.40.0-focal as base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Create non-root user for security
RUN groupadd -r playwright && useradd -r -g playwright -G audio,video playwright \
    && mkdir -p /home/playwright/Downloads \
    && chown -R playwright:playwright /home/playwright \
    && chown -R playwright:playwright /app

# Switch to non-root user
USER playwright

# Set environment variables
ENV NODE_ENV=production
ENV CI=true
ENV PWTEST_SKIP_TEST_OUTPUT=1

# Default command
CMD ["npx", "playwright", "test"]