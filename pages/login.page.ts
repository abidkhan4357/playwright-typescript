import { Page, Locator } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly credentialsErrorMessage: Locator;
    private readonly configManager: ConfigManager;

    constructor(page: Page) {
        this.page = page;
        this.configManager = ConfigManager.getInstance();

        this.emailInput = page.getByTestId('login-email');
        this.passwordInput = page.getByTestId('login-password');
        this.loginButton = page.getByTestId('login-button');
        this.credentialsErrorMessage = page.getByText('Your email or password is incorrect!');
    }

    async navigateToLoginPage(): Promise<void> {
        await this.page.goto(`${this.configManager.baseUrl}login`);
    }

    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}
