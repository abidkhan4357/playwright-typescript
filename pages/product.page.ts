import { Page, Locator, expect } from '@playwright/test';
import { ConfigManager } from '../core/config/config.manager';
import { Product } from '../core/data/factories/product.factory';

export class ProductPage {
    protected page: Page;
    protected configManager: ConfigManager;
    
    private readonly productsLink: Locator;
    private readonly cartLink: Locator;
    private readonly productItems: Locator;
    private readonly addToCartButtons: Locator;
    private readonly addedItemDialog: Locator;
    private readonly continueShoppingButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.configManager = ConfigManager.getInstance();
        
        this.productsLink = page.locator('.shop-menu .nav.navbar-nav li a[href="/products"]');
        this.cartLink = page.locator('.shop-menu .nav.navbar-nav li a[href="/view_cart"]');
        this.productItems = page.locator('.product-image-wrapper');
        this.addToCartButtons = page.locator('.btn.btn-default.add-to-cart');
        this.addedItemDialog = page.locator('#cartModal .modal-content');
        this.continueShoppingButton = page.locator('button.close-modal');
    }

    async navigateToProductsPage(): Promise<void> {
        await this.productsLink.click();
        await this.page.waitForURL('**/products**');
    }

    async addProductToCart(index: number): Promise<void> {
        const productCount = await this.productItems.count();
        
        if (index >= productCount) {
            throw new Error(`Product index ${index} is out of range. Only ${productCount} products available.`);
        }
        
        const productItem = this.productItems.nth(index);
        await productItem.scrollIntoViewIfNeeded();
        
        try {
            const directButton = productItem.locator('.productinfo .btn.btn-default.add-to-cart');
            
            if (await directButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await directButton.click();
            } else {
                await productItem.hover();
                const overlayButton = productItem.locator('.product-overlay .btn.btn-default.add-to-cart');
                await overlayButton.click({ timeout: 5000 });
            }
            
            await this.addedItemDialog.waitFor({ state: 'visible', timeout: 5000 });
            await this.continueShoppingButton.click();
            await this.addedItemDialog.waitFor({ state: 'hidden', timeout: 5000 });
        } catch (error) {
            try {
                await productItem.locator('a.add-to-cart').click({ force: true, timeout: 3000 });
                await this.addedItemDialog.waitFor({ state: 'visible', timeout: 5000 });
                await this.continueShoppingButton.click();
                await this.addedItemDialog.waitFor({ state: 'hidden', timeout: 5000 });
            } catch (innerError) {
                throw new Error(`Failed to add product to cart: ${error.message}`);
            }
        }
    }

    async viewCart(): Promise<void> {
        try {
            await Promise.all([
                this.page.waitForURL('**/view_cart**', { timeout: 10000 }),
                this.cartLink.click()
            ]);
            
            const cartTable = this.page.locator('#cart_info_table');
            await cartTable.waitFor({ state: 'visible', timeout: 10000 })
                .catch(() => {});
            
        } catch (error) {
            if (!this.page.url().includes('view_cart')) {
                await this.cartLink.click();
                await this.page.waitForTimeout(2000);
                
                if (!this.page.url().includes('view_cart')) {
                    throw new Error('Failed to navigate to cart page after retry');
                }
            }
        }
    }

    async getProductCount(): Promise<number> {
        return await this.productItems.count();
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('networkidle');
    }

    async addProductByName(productName: string): Promise<boolean> {
        await this.navigateToProductsPage();
        
        const productNameLocator = this.page.locator('.productinfo p', {
            hasText: productName
        });
        
        const count = await productNameLocator.count();
        if (count === 0) {
            return false;
        }
        
        const productElement = productNameLocator.first().locator('..').locator('..');
        
        try {
            await productElement.scrollIntoViewIfNeeded();
            
            const directButton = productElement.locator('.productinfo .btn.btn-default.add-to-cart');
            
            if (await directButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await directButton.click();
            } else {
                await productElement.hover();
                const overlayButton = productElement.locator('.product-overlay .btn.btn-default.add-to-cart');
                await overlayButton.click({ timeout: 5000 });
            }
            
            await this.addedItemDialog.waitFor({ state: 'visible', timeout: 5000 });
            await this.continueShoppingButton.click();
            await this.addedItemDialog.waitFor({ state: 'hidden', timeout: 5000 });
            
            return true;
        } catch (error) {
            return false;
        }
    }
}