import { Page, Locator } from '@playwright/test';

export class PaymentPage {
    readonly page: Page;
    readonly nameOnCardInput: Locator;
    readonly cardNumberInput: Locator;
    readonly cvcInput: Locator;
    readonly expiryMonthInput: Locator;
    readonly expiryYearInput: Locator;
    readonly payAndConfirmButton: Locator;
    readonly paymentForm: Locator;

    constructor(page: Page) {
        this.page = page;
        this.paymentForm = page.locator('#payment-form');
        this.nameOnCardInput = page.locator('input[name="name_on_card"]');
        this.cardNumberInput = page.locator('input[name="card_number"]');
        this.cvcInput = page.locator('input[name="cvc"]');
        this.expiryMonthInput = page.locator('input[name="expiry_month"]');
        this.expiryYearInput = page.locator('input[name="expiry_year"]');
        this.payAndConfirmButton = page.getByRole('button', { name: 'Pay and Confirm Order' });
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
        await this.nameOnCardInput.fill(nameOnCard);
        await this.cardNumberInput.fill(cardNumber);
        await this.cvcInput.fill(cvc);
        await this.expiryMonthInput.fill(expiryMonth);
        await this.expiryYearInput.fill(expiryYear);
    }

    async confirmPayment(): Promise<void> {
        await this.payAndConfirmButton.click();
        await this.page.waitForLoadState('networkidle');
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
