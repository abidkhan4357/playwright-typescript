import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
    readonly page: Page;
    readonly addressDetailsSection: Locator;
    readonly orderProductNames: Locator;
    readonly placeOrderButton: Locator;
    readonly commentTextarea: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addressDetailsSection = page.locator('#address_delivery');
        this.orderProductNames = page.locator('.cart_description h4 a');
        this.placeOrderButton = page.getByRole('link', { name: 'Place Order' });
        this.commentTextarea = page.locator('textarea[name="message"]');
    }

    async isOnCheckoutPage(): Promise<boolean> {
        return await this.addressDetailsSection.isVisible();
    }

    async getOrderProductNames(): Promise<string[]> {
        const count = await this.orderProductNames.count();
        const names: string[] = [];

        for (let i = 0; i < count; i++) {
            const name = await this.orderProductNames.nth(i).textContent();
            names.push(name?.trim() || '');
        }

        return names;
    }

    async addOrderComment(comment: string): Promise<void> {
        await this.commentTextarea.fill(comment);
    }

    async placeOrder(): Promise<void> {
        await this.placeOrderButton.click();
        await this.page.waitForURL('**/payment');
    }
}
