import { test, expect } from '../../core/fixtures/page.fixture';
import { UserFactory } from '../../core/data/factories/user.factory';

test.describe('Login feature tests', () => {
    const userFactory = new UserFactory();

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateToLoginPage();
    });

    test('should login successfully with valid credentials', async ({ loginPage, homePage }) => {
        const validUser = userFactory.generate('validUser');

        await loginPage.login(validUser.email, validUser.password);

        await expect(homePage.loggedInAsText).toContainText(validUser.firstName);
    });

    test('should show error message with invalid email and invalid password', async ({ loginPage }) => {
        const invalidCredentials = userFactory.generate('invalidEmailAndPassword');

        await loginPage.login(invalidCredentials.email, invalidCredentials.password);

        await expect(loginPage.credentialsErrorMessage).toBeVisible();
    });

    test('should show error message with invalid email', async ({ loginPage }) => {
        const invalidEmail = userFactory.generate('invalidEmail');

        await loginPage.login(invalidEmail.email, invalidEmail.password);

        await expect(loginPage.credentialsErrorMessage).toBeVisible();
    });

    test('should show error message with invalid password', async ({ loginPage }) => {
        const invalidPassword = userFactory.generate('invalidPassword');

        await loginPage.login(invalidPassword.email, invalidPassword.password);

        await expect(loginPage.credentialsErrorMessage).toBeVisible();
    });

    test('should show error message with empty credentials', async ({ loginPage }) => {
        const emptyUser = userFactory.generate('emptyCredentials');

        await loginPage.login(emptyUser.email, emptyUser.password);

        await expect(loginPage.loginButton).toBeVisible();
    });
});
