import { Page, Locator } from '@playwright/test';

export class OrderConfirmationPage {
    readonly page: Page;
    readonly orderSuccessMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.orderSuccessMessage = page.getByTestId('order-placed');
    }

    async isOrderSuccessful(): Promise<boolean> {
        return this.orderSuccessMessage.isVisible();
    }
}
