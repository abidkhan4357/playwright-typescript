import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { HomePage } from '../../pages/home.page';
import { SignupPage } from '../../pages/signup.page';
import { ProductPage } from '../../pages/product.page';
import { CartPage } from '../../pages/cart.page';
import { CheckoutPage } from '../../pages/checkout.page';
import { PaymentPage } from '../../pages/payment.page';
import { OrderConfirmationPage } from '../../pages/order-confirmation.page';
import { UserService } from '../api/services/user.service';

/**
 * Extended test fixture that provides page objects
 * Makes pages available in tests via destructuring
 */
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
}>({
    // Define login page fixture
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    // Define home page fixture
    homePage: async ({ page }, use) => {
        // Create HomePage when implemented
        await use(new HomePage(page));
    },

    // Define signup page fixture
    signupPage: async ({ page }, use) => {
        await use(new SignupPage(page));
    },
    
    // Define product page fixture
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },
    
    // Define cart page fixture
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    
    // Define checkout page fixture
    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },
    
    // Define payment page fixture
    paymentPage: async ({ page }, use) => {
        await use(new PaymentPage(page));
    },
    
    // Define order confirmation page fixture
    orderConfirmationPage: async ({ page }, use) => {
        await use(new OrderConfirmationPage(page));
    },
    
    // Define user service API fixture
    userService: async ({}, use) => {
        const userService = new UserService();
        await userService.init();
        await use(userService);
    }
});

// Export the expect function for assertions
export { expect } from '@playwright/test';
