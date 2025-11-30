import { Page, Locator } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly loggedInAsText: Locator;
    readonly logoutLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loggedInAsText = page.locator('a', { hasText: 'Logged in as' });
        this.logoutLink = page.getByRole('link', { name: 'Logout' });
    }

    async getLoggedInAsText(): Promise<string> {
        return await this.loggedInAsText.innerText();
    }

    async isLoggedIn(): Promise<boolean> {
        return await this.loggedInAsText.isVisible();
    }

    async isLogoutVisible(options?: { timeout?: number }): Promise<boolean> {
        return await this.logoutLink.isVisible(options);
    }

    async logout(): Promise<void> {
        await this.logoutLink.click();
    }
}
