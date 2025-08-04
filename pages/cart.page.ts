import { Page, Locator, expect } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';

export class CartPage {
    protected page: Page;
    protected configManager: ConfigManager;
    
    private readonly cartItems: Locator;
    private readonly cartProductNames: Locator;
    private readonly proceedToCheckoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.configManager = ConfigManager.getInstance();
        
        this.cartItems = page.locator('table#cart_info_table tbody tr[id^="product-"]');
        this.cartProductNames = page.locator('.cart_description h4 a');
        this.proceedToCheckoutButton = page.locator('.check_out');
    }

    async getCartItemCount(): Promise<number> {
        await this.page.waitForTimeout(2000);
        
        try {
            const emptyCartElement = this.page.locator('#empty_cart');
            const emptyCartStyle = await emptyCartElement.getAttribute('style');
            if (emptyCartStyle && !emptyCartStyle.includes('display: none')) {
                return 0;
            }
            
            const count = await this.cartItems.count();
            return count;
        } catch (error) {
            return 0;
        }
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
    
    async assertProductInCart(productName: string): Promise<void> {
        const productNames = await this.getCartProductNames();
        expect(productNames).toContain(productName);
    }
}
