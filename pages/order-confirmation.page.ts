import { Page, Locator, expect } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';

export class OrderConfirmationPage {
  protected page: Page;
  protected configManager: ConfigManager;

  private readonly orderSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.configManager = ConfigManager.getInstance();
    this.orderSuccessMessage = page.locator('h2.title[data-qa="order-placed"]');
  }

  async isOrderSuccessful(): Promise<boolean> {
    return this.orderSuccessMessage.isVisible();
  }

  async assertOrderPlacedSuccessfully(): Promise<void> {
    await expect(this.orderSuccessMessage).toBeVisible({ timeout: 30000 });
  }
}
