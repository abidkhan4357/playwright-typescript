import { Page, Locator, expect } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';

export class PaymentPage {
    protected page: Page;
    protected configManager: ConfigManager;
    
    private readonly nameOnCardInput: Locator;
    private readonly cardNumberInput: Locator;
    private readonly cvcInput: Locator;
    private readonly expiryMonthInput: Locator;
    private readonly expiryYearInput: Locator;
    private readonly payAndConfirmButton: Locator;
    private readonly paymentForm: Locator;

    constructor(page: Page) {
        this.page = page;
        this.configManager = ConfigManager.getInstance();
        
        this.paymentForm = page.locator('form.payment-form');
        this.nameOnCardInput = page.locator('input[name="name_on_card"]');
        this.cardNumberInput = page.locator('input[name="card_number"]');
        this.cvcInput = page.locator('input[name="cvc"]');
        this.expiryMonthInput = page.locator('input[name="expiry_month"]');
        this.expiryYearInput = page.locator('input[name="expiry_year"]');
        this.payAndConfirmButton = page.locator('#submit');
    }
    
    async isOnPaymentPage(): Promise<boolean> {
        return await this.paymentForm.isVisible();
    }

    async fillPaymentInformation(
        nameOnCard: string,
        cardNumber: string,
        cvc: string,
        expiryMonth: string,
        expiryYear: string
    ): Promise<void> {
        await this.nameOnCardInput.clear();
        await this.nameOnCardInput.fill(nameOnCard);
        await this.cardNumberInput.clear();
        await this.cardNumberInput.fill(cardNumber);
        await this.cvcInput.clear();
        await this.cvcInput.fill(cvc);
        await this.expiryMonthInput.clear();
        await this.expiryMonthInput.fill(expiryMonth);
        await this.expiryYearInput.clear();
        await this.expiryYearInput.fill(expiryYear);
    }

    async confirmPayment(): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState('networkidle', { timeout: 30000 }),
            this.payAndConfirmButton.click()
        ]);
    }

    async completePayment(
        nameOnCard: string,
        cardNumber: string,
        cvc: string,
        expiryMonth: string,
        expiryYear: string
    ): Promise<void> {
        await this.fillPaymentInformation(nameOnCard, cardNumber, cvc, expiryMonth, expiryYear);
        await this.confirmPayment();
    }
}
