import { Page, Locator, expect } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';
import { UserAccount } from '../core/models/user.model';

export class SignupPage {
    protected page: Page;
    private readonly nameInput: Locator;
    private readonly emailInput: Locator;
    private readonly signupButton: Locator;
    
    private readonly titleRadioButton: Locator;
    private readonly passwordInput: Locator;
    private readonly dayDropdown: Locator;
    private readonly monthDropdown: Locator;
    private readonly yearDropdown: Locator;
    private readonly newsletterCheckbox: Locator;
    private readonly specialOffersCheckbox: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly addressInput: Locator;
    private readonly countryDropdown: Locator;
    private readonly stateInput: Locator;
    private readonly cityInput: Locator;
    private readonly zipcodeInput: Locator;
    private readonly phoneInput: Locator;
    private readonly createAccountButton: Locator;
    
    private readonly accountCreatedMessage: Locator;
    private readonly emailExistsErrorMessage: Locator;

    private readonly configManager: ConfigManager;

    constructor(page: Page) {
        this.page = page;
        this.configManager = ConfigManager.getInstance();
        
        this.nameInput = page.getByPlaceholder('Name');
        this.emailInput = page.locator("input[data-qa='signup-email']");
        this.signupButton = page.getByRole('button', { name: 'Signup' });
        
        this.titleRadioButton = page.locator("id=id_gender1");
        this.passwordInput = page.locator("id=password");
        this.dayDropdown = page.locator("id=days");
        this.monthDropdown = page.locator("id=months");
        this.yearDropdown = page.locator("id=years");
        this.newsletterCheckbox = page.locator("id=newsletter");
        this.specialOffersCheckbox = page.locator("id=optin");
        this.firstNameInput = page.locator("id=first_name");
        this.lastNameInput = page.locator("id=last_name");
        this.addressInput = page.locator("id=address1");
        this.countryDropdown = page.locator("id=country");
        this.stateInput = page.locator("id=state");
        this.cityInput = page.locator("id=city");
        this.zipcodeInput = page.locator("id=zipcode");
        this.phoneInput = page.locator("id=mobile_number");
        this.createAccountButton = page.getByRole('button', { name: 'Create Account' });
        
        this.accountCreatedMessage = page.getByText('Account Created!');
        this.emailExistsErrorMessage = page.getByText('Email Address already exist!');
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

    async selectOption(locator: Locator, value: string): Promise<void> {
        await locator.selectOption(value);
    }

    async isVisible(locator: Locator): Promise<boolean> {
        return await locator.isVisible();
    }

    async expectToBeVisible(locator: Locator): Promise<void> {
        await expect(locator).toBeVisible();
    }

    async navigateToSignupPage(): Promise<void> {
        await this.navigateTo(this.configManager.baseUrl, 'signup');
    }

    async enterInitialSignupInfo(name: string, email: string): Promise<void> {
        await this.fill(this.nameInput, name);
        await this.fill(this.emailInput, email);
        await this.click(this.signupButton);
    }

    async fillAccountInformation(user: Partial<UserAccount>): Promise<void> {
        await this.click(this.titleRadioButton);
        
        await this.fill(this.passwordInput, user.password || '');
        
        if (user.dateOfBirth) {
            const [year, month, day] = user.dateOfBirth.split('-');
            await this.selectOption(this.dayDropdown, day);
            await this.selectOption(this.monthDropdown, month);
            await this.selectOption(this.yearDropdown, year);
        } else {
            await this.selectOption(this.dayDropdown, '1');
            await this.selectOption(this.monthDropdown, '1');
            await this.selectOption(this.yearDropdown, '1990');
        }
        
        await this.click(this.newsletterCheckbox);
        await this.click(this.specialOffersCheckbox);
        
        await this.fill(this.firstNameInput, user.firstName || '');
        await this.fill(this.lastNameInput, user.lastName || '');
        await this.fill(this.addressInput, user.address?.street || '');
        
        await this.page.selectOption('#country', 'United States');
        
        await this.fill(this.stateInput, user.address?.state || '');
        await this.fill(this.cityInput, user.address?.city || '');
        await this.fill(this.zipcodeInput, user.address?.zipCode || '');
        await this.fill(this.phoneInput, user.phone || '');
    }

    async submitAccountCreation(): Promise<void> {
        await this.click(this.createAccountButton);
        await this.page.waitForURL('**/account_created');
    }

    async signupNewUser(user: Partial<UserAccount>): Promise<void> {
        const fullName = `${user.firstName} ${user.lastName}`;
        await this.enterInitialSignupInfo(fullName, user.email!);
        
        await this.fillAccountInformation(user);
        
        await this.submitAccountCreation();
    }

    async assertAccountCreatedSuccessfully(): Promise<void> {
        await this.expectToBeVisible(this.accountCreatedMessage);
    }

    async assertEmailAlreadyExists(): Promise<void> {
        await this.expectToBeVisible(this.emailExistsErrorMessage);
    }

    async isOnSignupPage(): Promise<boolean> {
        return await this.isVisible(this.signupButton);
    }
}
