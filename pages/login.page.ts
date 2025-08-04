import { Page, Locator, expect } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';

export class LoginPage {
    protected page: Page;
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly credentialsErrorMessage: Locator;
    private readonly configManager: ConfigManager;

    constructor(page: Page) {
        this.page = page;
        this.configManager = ConfigManager.getInstance();
        
        this.emailInput = page.locator("input[data-qa='login-email']");
        this.passwordInput = page.locator("input[data-qa='login-password']");
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.credentialsErrorMessage = page.getByText("Your email or password is incorrect!");
    }

    async navigateTo(baseUrl: string, path: string): Promise<void> {
        await this.page.goto(`${baseUrl}${path}`);
    }

    async fill(locator: Locator, text: string): Promise<void> {
        await locator.clear();
        await locator.fill(text);
    }

    async click(locator: Locator): Promise<void> {
        await locator.click();
    }

    async isVisible(locator: Locator): Promise<boolean> {
        return await locator.isVisible();
    }

    async expectToBeVisible(locator: Locator): Promise<void> {
        await expect(locator).toBeVisible();
    }

    async navigateToLoginPage(): Promise<void> {
        await this.navigateTo(this.configManager.baseUrl, 'login');
    }

    async login(email: string, password: string): Promise<void> {
        await this.fill(this.emailInput, email);
        await this.fill(this.passwordInput, password);
        await this.click(this.loginButton);
    }

    async assertInvalidCredentialsError(): Promise<void> {
        await this.expectToBeVisible(this.credentialsErrorMessage);
    }

    async isOnLoginPage(): Promise<boolean> {
        return await this.isVisible(this.loginButton);
    }
}