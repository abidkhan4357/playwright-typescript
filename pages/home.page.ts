import { Page, Locator } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';

export class HomePage {
    protected page: Page;
    private readonly configManager: ConfigManager;
    private readonly userNameText: Locator;
    private readonly logoutLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.configManager = ConfigManager.getInstance();
        this.userNameText = page.locator("a:has-text('Logged in as')");
        this.logoutLink = page.locator("a:has-text('Logout')");
    }

    async getText(locator: Locator): Promise<string> {
        return await locator.innerText();
    }

    async isVisible(locator: Locator): Promise<boolean> {
        return await locator.isVisible();
    }

    async getLoggedInAsText(): Promise<string> {
        return await this.getText(this.userNameText);
    }
    
    async isLoggedIn(): Promise<boolean> {
        return await this.isVisible(this.userNameText);
    }

    async isLogoutVisible(options?: { timeout?: number }): Promise<boolean> {
        return await this.logoutLink.isVisible(options);
    }

    async logout(): Promise<void> {
        await this.logoutLink.click();
    }
}
