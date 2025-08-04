import { test, expect } from '../../core/fixtures/page.fixture';
import { UserFactory } from '../../core/data/factories/user.factory';

test.describe('Login feature tests', () => {
    const userFactory = new UserFactory();
    
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateToLoginPage();
    });

    test('should login successfully with valid credentials', async ({ loginPage, homePage }) => {
        // Get valid user credentials
        const validUser = userFactory.generate('validUser');
        
        await loginPage.login(validUser.email, validUser.password);

        const loggedInAsText = await homePage.getLoggedInAsText();
        expect(loggedInAsText).toContain(validUser.firstName);
    });

    test('should show error message with invalid email and invalid password', async ({ loginPage }) => {
        // Get user with invalid email and password
        const invalidCredentials = userFactory.generate('invalidEmailAndPassword');
        
        await loginPage.login(invalidCredentials.email, invalidCredentials.password);
        
        await loginPage.assertInvalidCredentialsError();
    });

    test('should show error message with invalid email', async ({ loginPage }) => {
        // Get user with invalid email
        const invalidEmail = userFactory.generate('invalidEmail');
        
        await loginPage.login(invalidEmail.email, invalidEmail.password);
        
        await loginPage.assertInvalidCredentialsError();
    });

    test('should show error message with invalid password', async ({ loginPage }) => {
        // Get user with invalid password
        const invalidPassword = userFactory.generate('invalidPassword');
        
        await loginPage.login(invalidPassword.email, invalidPassword.password);
        
        await loginPage.assertInvalidCredentialsError();
    });

    test('should show error message with empty credentials', async ({ loginPage }) => {
        // Get empty credentials
        const emptyUser = userFactory.generate('emptyCredentials');
        
        await loginPage.login(emptyUser.email, emptyUser.password);
        
        // Assert - User is still on login page (not logged in)
        const isOnLoginPage = await loginPage.isOnLoginPage();
        expect(isOnLoginPage).toBeTruthy();
    });
});