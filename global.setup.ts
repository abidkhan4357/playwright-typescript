import { Browser, chromium, BrowserContext, Page } from '@playwright/test';
import { ConfigManager } from './core/config/config.manager';
import { UserFactory } from './core/data/factories/user.factory';

async function globalSetup() {
  // Get configuration
  const configManager = ConfigManager.getInstance();
  const userFactory = new UserFactory();
  const validUser = userFactory.generate('validUser');
  const baseUrl = configManager.baseUrl;
  
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
    
    // Click login button and wait for URL to change or logout button to appear
    await Promise.all([
      page.click('[data-qa="login-button"]'),
      // Use page evaluate for browser context operations
      page.waitForFunction(`
        (currentUrl) => {
          // Either the URL changes from login page or the Logout button appears
          return window.location.href !== currentUrl || 
                 document.querySelector('a:has-text("Logout")') !== null;
        }
      `, page.url(), { timeout: 20000 })
    ]);
    
    // Give the page a moment to settle
    await page.waitForTimeout(2000);
    
    // Check if login was successful by looking for the Logout link
    const isLoggedIn = await page.isVisible('a:has-text("Logout")');
    
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
