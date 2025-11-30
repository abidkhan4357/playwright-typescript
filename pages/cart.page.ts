import { Page, Locator } from '@playwright/test';

export class CartPage {
    readonly page: Page;
    readonly cartTable: Locator;
    readonly cartItems: Locator;
    readonly cartProductNames: Locator;
    readonly proceedToCheckoutButton: Locator;
    readonly emptyCartMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartTable = page.locator('#cart_info_table');
        this.cartItems = page.locator('#cart_info_table tbody tr[id^="product-"]');
        this.cartProductNames = page.locator('.cart_description h4 a');
        this.proceedToCheckoutButton = page.getByText('Proceed To Checkout');
        this.emptyCartMessage = page.locator('#empty_cart');
    }

    async getCartItemCount(): Promise<number> {
        await this.cartTable.waitFor({ state: 'visible' }).catch(() => {});

        const isEmptyCartVisible = await this.emptyCartMessage.isVisible();
        if (isEmptyCartVisible) {
            const style = await this.emptyCartMessage.getAttribute('style');
            if (!style?.includes('display: none')) {
                return 0;
            }
        }

        return await this.cartItems.count();
    }

    async getCartProductNames(): Promise<string[]> {
        const count = await this.cartProductNames.count();
        const names: string[] = [];

        for (let i = 0; i < count; i++) {
            const name = await this.cartProductNames.nth(i).textContent();
            names.push(name?.trim() || '');
        }

        return names;
    }

    async proceedToCheckout(): Promise<void> {
        await this.proceedToCheckoutButton.click();
    }
}
