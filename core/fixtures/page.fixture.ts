import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { HomePage } from '../../pages/home.page';
import { SignupPage } from '../../pages/signup.page';
import { ProductPage } from '../../pages/product.page';
import { CartPage } from '../../pages/cart.page';
import { CheckoutPage } from '../../pages/checkout.page';
import { PaymentPage } from '../../pages/payment.page';
import { OrderConfirmationPage } from '../../pages/order-confirmation.page';
import { UserService } from '../api/services/user.service';
import { PoolManager, TestUser, PoolName } from '../data/providers';

const blockedDomains = [
    'googleads.g.doubleclick.net',
    'pagead2.googlesyndication.com',
    'adservice.google.com',
    'www.googletagservices.com',
    'google-analytics.com',
    'analytics.google.com'
];

async function blockAds(page: Page): Promise<void> {
    await page.route('**/*', (route) => {
        const url = route.request().url();
        if (blockedDomains.some(domain => url.includes(domain))) {
            route.abort();
        } else {
            route.continue();
        }
    });
}

interface PoolFixture {
    consumeFreshUser: () => Promise<TestUser | null>;
    acquireRegisteredUser: () => Promise<TestUser | null>;
    releaseRegisteredUser: (user: TestUser) => Promise<void>;
}

export const test = base.extend<{
    loginPage: LoginPage;
    homePage: HomePage;
    signupPage: SignupPage;
    productPage: ProductPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
    paymentPage: PaymentPage;
    orderConfirmationPage: OrderConfirmationPage;
    userService: UserService;
    pool: PoolFixture;
}>({
    page: async ({ page }, use) => {
        await blockAds(page);
        await use(page);
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    signupPage: async ({ page }, use) => {
        await use(new SignupPage(page));
    },
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },
    paymentPage: async ({ page }, use) => {
        await use(new PaymentPage(page));
    },
    orderConfirmationPage: async ({ page }, use) => {
        await use(new OrderConfirmationPage(page));
    },
    userService: async ({}, use) => {
        const userService = new UserService();
        await userService.init();
        await use(userService);
    },
    pool: async ({}, use) => {
        const poolManager = PoolManager.getInstance();
        const acquiredRegisteredUsers: TestUser[] = [];

        const fixture: PoolFixture = {
            consumeFreshUser: async () => {
                return poolManager.consumeUser(PoolName.USERS_FRESH);
            },
            acquireRegisteredUser: async () => {
                const user = await poolManager.acquireUser(PoolName.USERS_REGISTERED);
                if (user) {
                    acquiredRegisteredUsers.push(user);
                }
                return user;
            },
            releaseRegisteredUser: async (user: TestUser) => {
                await poolManager.releaseUser(PoolName.USERS_REGISTERED, user);
                const index = acquiredRegisteredUsers.findIndex(u => u.email === user.email);
                if (index !== -1) {
                    acquiredRegisteredUsers.splice(index, 1);
                }
            }
        };

        await use(fixture);

        for (const user of acquiredRegisteredUsers) {
            await poolManager.releaseUser(PoolName.USERS_REGISTERED, user);
        }
    }
});

export { expect } from '@playwright/test';
export { PoolName } from '../data/providers';
