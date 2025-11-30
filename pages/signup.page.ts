import { Page, Locator } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';
import { UserAccount } from '../core/models/user.model';

export class SignupPage {
    readonly page: Page;
    readonly nameInput: Locator;
    readonly emailInput: Locator;
    readonly signupButton: Locator;
    readonly titleRadioButton: Locator;
    readonly passwordInput: Locator;
    readonly dayDropdown: Locator;
    readonly monthDropdown: Locator;
    readonly yearDropdown: Locator;
    readonly newsletterCheckbox: Locator;
    readonly specialOffersCheckbox: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly addressInput: Locator;
    readonly countryDropdown: Locator;
    readonly stateInput: Locator;
    readonly cityInput: Locator;
    readonly zipcodeInput: Locator;
    readonly phoneInput: Locator;
    readonly createAccountButton: Locator;
    readonly accountCreatedMessage: Locator;
    readonly emailExistsErrorMessage: Locator;
    private readonly configManager: ConfigManager;

    constructor(page: Page) {
        this.page = page;
        this.configManager = ConfigManager.getInstance();

        this.nameInput = page.getByPlaceholder('Name');
        this.emailInput = page.getByTestId('signup-email');
        this.signupButton = page.getByTestId('signup-button');
        this.titleRadioButton = page.locator('#id_gender1');
        this.passwordInput = page.locator('#password');
        this.dayDropdown = page.locator('#days');
        this.monthDropdown = page.locator('#months');
        this.yearDropdown = page.locator('#years');
        this.newsletterCheckbox = page.locator('#newsletter');
        this.specialOffersCheckbox = page.locator('#optin');
        this.firstNameInput = page.locator('#first_name');
        this.lastNameInput = page.locator('#last_name');
        this.addressInput = page.locator('#address1');
        this.countryDropdown = page.locator('#country');
        this.stateInput = page.locator('#state');
        this.cityInput = page.locator('#city');
        this.zipcodeInput = page.locator('#zipcode');
        this.phoneInput = page.locator('#mobile_number');
        this.createAccountButton = page.getByTestId('create-account');
        this.accountCreatedMessage = page.getByText('Account Created!');
        this.emailExistsErrorMessage = page.getByText('Email Address already exist!');
    }

    async navigateToSignupPage(): Promise<void> {
        await this.page.goto(`${this.configManager.baseUrl}signup`);
    }

    async enterInitialSignupInfo(name: string, email: string): Promise<void> {
        await this.nameInput.fill(name);
        await this.emailInput.fill(email);
        await this.signupButton.click();
    }

    async fillAccountInformation(user: Partial<UserAccount>): Promise<void> {
        await this.titleRadioButton.click();
        await this.passwordInput.fill(user.password || '');

        if (user.dateOfBirth) {
            const [year, month, day] = user.dateOfBirth.split('-');
            await this.dayDropdown.selectOption(day);
            await this.monthDropdown.selectOption(month);
            await this.yearDropdown.selectOption(year);
        } else {
            await this.dayDropdown.selectOption('1');
            await this.monthDropdown.selectOption('1');
            await this.yearDropdown.selectOption('1990');
        }

        await this.newsletterCheckbox.click();
        await this.specialOffersCheckbox.click();
        await this.firstNameInput.fill(user.firstName || '');
        await this.lastNameInput.fill(user.lastName || '');
        await this.addressInput.fill(user.address?.street || '');
        await this.countryDropdown.selectOption('United States');
        await this.stateInput.fill(user.address?.state || '');
        await this.cityInput.fill(user.address?.city || '');
        await this.zipcodeInput.fill(user.address?.zipCode || '');
        await this.phoneInput.fill(user.phone || '');
    }

    async submitAccountCreation(): Promise<void> {
        await this.createAccountButton.click();
        await this.page.waitForURL('**/account_created');
    }

    async signupNewUser(user: Partial<UserAccount>): Promise<void> {
        const fullName = `${user.firstName} ${user.lastName}`;
        await this.enterInitialSignupInfo(fullName, user.email!);
        await this.fillAccountInformation(user);
        await this.submitAccountCreation();
    }
}
