import { Page, Locator, expect } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';

export class CheckoutPage {
    protected page: Page;
    protected configManager: ConfigManager;
    
    private readonly addressDetailsSection: Locator;
    private readonly orderProductNames: Locator;
    private readonly placeOrderButton: Locator;
    private readonly commentTextarea: Locator;

    constructor(page: Page) {
        this.page = page;
        this.configManager = ConfigManager.getInstance();
        
        this.addressDetailsSection = page.locator('#address_delivery');
        this.orderProductNames = page.locator('.cart_description h4 a');
        this.placeOrderButton = page.locator('a.check_out, .btn.btn-default.check_out');
        this.commentTextarea = page.locator('textarea[name="message"]');
    }
    
    async isOnCheckoutPage(): Promise<boolean> {
        return await this.addressDetailsSection.isVisible({ timeout: 5000 })
            .catch(() => false);
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
        await this.commentTextarea.clear();
        await this.commentTextarea.fill(comment);
    }

    async placeOrder(): Promise<void> {
        try {
            await this.placeOrderButton.waitFor({ state: 'visible', timeout: 10000 });
            
            await Promise.all([
                this.page.waitForNavigation({ timeout: 30000 }).catch(() => {}),
                this.placeOrderButton.click()
            ]);
        } catch (error) {
            await this.placeOrderButton.click({ force: true });
            await this.page.waitForLoadState('networkidle', { timeout: 30000 });
        }
    }
    
    async assertProductInOrder(productName: string): Promise<void> {
        const productNames = await this.getOrderProductNames();
        expect(productNames).toContain(productName);
    }
}
