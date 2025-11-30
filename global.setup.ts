import { Browser, chromium, BrowserContext, Page } from '@playwright/test';
import { ConfigManager } from './core/config/config.manager';
import { UserFactory } from './core/data/factories/user.factory';
import { PoolManager } from './core/data/providers';
import { PoolName } from './core/data/providers/test-data.provider';

async function checkAndSeedPools(): Promise<void> {
  const config = ConfigManager.getInstance();
  const redisConfig = config.redisConfig;

  if (!redisConfig.enabled) {
    console.log('Redis pools disabled, skipping pool check');
    return;
  }

  try {
    const poolManager = PoolManager.getInstance();
    const stats = await poolManager.getStats(PoolName.USERS_FRESH);

    console.log(`Pool status - Available: ${stats.available}, Processing: ${stats.processing}`);

    if (stats.available < redisConfig.poolMinThreshold) {
      console.log(`Pool below threshold (${redisConfig.poolMinThreshold}), consider running: npm run pool:seed`);
    }

    await poolManager.close();
  } catch (error) {
    console.log('Redis not available, tests will use API fallback');
  }
}

async function globalSetup() {
  const configManager = ConfigManager.getInstance();
  const userFactory = new UserFactory();
  const validUser = userFactory.generate('validUser');
  const baseUrl = configManager.baseUrl;

  await checkAndSeedPools();
  
  console.log(`Using baseUrl: ${baseUrl}`);
  
  // Launch a browser instance for authentication
  const browser: Browser = await chromium.launch({ headless: true }); 
  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page: Page = await context.newPage();
  
  try {
    // Navigate to login page with full URL
    console.log('Performing global authentication setup...');
    await page.goto(`${baseUrl}/login`);
    
    // Login with valid credentials - using direct locators instead of page objects
    console.log(`Logging in with email: ${validUser.email}`);
    
    // Wait for the login form to be visible
    await page.waitForSelector('[data-qa="login-email"]', { timeout: 10000 });
    
    // Fill login form
    await page.fill('[data-qa="login-email"]', validUser.email);
    await page.fill('[data-qa="login-password"]', validUser.password);
    
    // Click login button and wait for logout link to appear (indicates successful login)
    await page.click('[data-qa="login-button"]');

    // Wait for logout link to be visible - this confirms successful authentication
    const logoutLink = page.getByRole('link', { name: 'Logout' });
    await logoutLink.waitFor({ state: 'visible', timeout: 20000 });

    const isLoggedIn = await logoutLink.isVisible();
    
    if (isLoggedIn) {
      console.log('Authentication successful');
      // Store authentication state
      await context.storageState({ path: './auth.json' });
      console.log('Auth state saved to auth.json');
    } else {
      console.error('Authentication failed - Logout link not found');
      // Try to log what's on the page for debugging
      console.log('Current URL:', page.url());
      const pageContent = await page.content();
      console.log('Page content snippet:', pageContent.substring(0, 300) + '...');
    }
  } catch (error) {
    console.error('Authentication setup error:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

export default globalSetup;
