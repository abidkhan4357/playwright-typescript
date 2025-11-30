import { Page, Locator } from '@playwright/test';

export class ProductPage {
    readonly page: Page;
    readonly productsLink: Locator;
    readonly cartLink: Locator;
    readonly productItems: Locator;
    readonly addedItemDialog: Locator;
    readonly continueShoppingButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.productsLink = page.getByRole('link', { name: 'Products' });
        this.cartLink = page.getByRole('link', { name: 'Cart' });
        this.productItems = page.locator('.product-image-wrapper');
        this.addedItemDialog = page.locator('#cartModal .modal-content');
        this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
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
        await productItem.hover();

        const addToCartButton = productItem.locator('.product-overlay .add-to-cart');
        await addToCartButton.click();

        await this.addedItemDialog.waitFor({ state: 'visible' });
        await this.continueShoppingButton.click();
        await this.addedItemDialog.waitFor({ state: 'hidden' });
    }

    async viewCart(): Promise<void> {
        await this.cartLink.click();
        await this.page.waitForURL('**/view_cart**');
        await this.page.locator('#cart_info_table').waitFor({ state: 'visible' });
    }

    async getProductCount(): Promise<number> {
        return await this.productItems.count();
    }

    async reload(): Promise<void> {
        await this.page.reload();
        await this.page.waitForLoadState('networkidle');
    }

    async addProductByName(productName: string): Promise<void> {
        await this.navigateToProductsPage();

        const productCard = this.page.locator('.product-image-wrapper', { hasText: productName });
        await productCard.scrollIntoViewIfNeeded();
        await productCard.hover();

        const addToCartButton = productCard.locator('.product-overlay .add-to-cart');
        await addToCartButton.click();

        await this.addedItemDialog.waitFor({ state: 'visible' });
        await this.continueShoppingButton.click();
        await this.addedItemDialog.waitFor({ state: 'hidden' });
    }
}
