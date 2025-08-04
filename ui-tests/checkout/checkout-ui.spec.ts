import { test, expect } from '../../core/fixtures/page.fixture';
import { PaymentFactory } from '../../core/data/factories/payment.factory';
import { ProductFactory } from '../../core/data/factories/product.factory';

//This test is using playwright storage state feature to login with already authenticated user
test.use({ 
  storageState: './auth.json' 
});

test.describe('Checkout feature tests', () => {
    const paymentFactory = new PaymentFactory();
    const productFactory = new ProductFactory();
    
    test.beforeEach(async ({ page, homePage }) => {
        await page.goto('/');
        await expect(homePage.isLogoutVisible({ timeout: 10000 })).resolves.toBeTruthy();
    });
    
    test('should complete checkout process', async ({ 
        productPage, 
        cartPage, 
        checkoutPage, 
        paymentPage, 
        orderConfirmationPage
    }) => {

        //use api to get the product list
        const products = await productFactory.getAllProductListByApi();
        
        const product1 = products.find(p => p.name === 'Blue Top');
        const product2 = products.find(p => p.name === 'Men Tshirt');
        
        await productPage.navigateToProductsPage();
        
        await productPage.addProductByName(product1.name);
        await productPage.addProductByName(product2.name);  
        
        await productPage.viewCart();
        
        const cartItemCount = await cartPage.getCartItemCount();
        expect(cartItemCount).toBeGreaterThan(0);
        
        await cartPage.proceedToCheckout();
        
        expect(await checkoutPage.isOnCheckoutPage()).toBeTruthy();
        
        await checkoutPage.addOrderComment('Please deliver during business hours.');
        await checkoutPage.placeOrder();
        
        const paymentInfo = paymentFactory.generate('valid');
        
        await paymentPage.completePayment(
            paymentInfo.nameOnCard,
            paymentInfo.cardNumber,
            paymentInfo.cvc,
            paymentInfo.expiryMonth,
            paymentInfo.expiryYear
        );
        
        await orderConfirmationPage.assertOrderPlacedSuccessfully();
    });
});