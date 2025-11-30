import { test, expect } from '../../core/fixtures/page.fixture';
import { UserFactory } from '../../core/data/factories/user.factory';

test.describe('Signup feature tests', () => {
    const userFactory = new UserFactory();
    let testUserEmail: string;
    let testUserPassword: string;

    test.beforeEach(async ({ signupPage }) => {
        await signupPage.navigateToSignupPage();
    });

    test.afterEach(async ({ userService }) => {
        if (testUserEmail && testUserPassword) {
            try {
                await userService.deleteAccount(testUserEmail, testUserPassword);
            } catch {
                // Ignore cleanup errors
            }
            testUserEmail = '';
            testUserPassword = '';
        }
    });

    test('should successfully create a new account with valid information', async ({ signupPage }) => {
        const newUser = userFactory.generate('randomUser');
        testUserEmail = newUser.email!;
        testUserPassword = newUser.password!;

        await signupPage.signupNewUser(newUser);

        await expect(signupPage.accountCreatedMessage).toBeVisible();
    });

    test('should show error message when trying to signup with existing email', async ({ signupPage, userService }) => {
        const apiTestUser = userFactory.generate('randomUser');
        testUserEmail = apiTestUser.email!;
        testUserPassword = apiTestUser.password!;

        const apiResponse = await userService.createUser({
            name: `${apiTestUser.firstName} ${apiTestUser.lastName}`,
            email: testUserEmail,
            password: testUserPassword,
            title: 'Mr',
            birth_date: '10',
            birth_month: '5',
            birth_year: '1990',
            firstname: apiTestUser.firstName!,
            lastname: apiTestUser.lastName!,
            company: 'Test Company',
            address1: apiTestUser.address?.street || '123 Test St',
            address2: 'Apt 1',
            country: 'United States',
            zipcode: apiTestUser.address?.zipCode || '12345',
            state: apiTestUser.address?.state || 'NY',
            city: apiTestUser.address?.city || 'New York',
            mobile_number: apiTestUser.phone || '5551234567'
        });

        expect(apiResponse.data.responseCode).toBe(201);

        const fullName = `${apiTestUser.firstName} ${apiTestUser.lastName}`;
        await signupPage.enterInitialSignupInfo(fullName, apiTestUser.email!);

        await expect(signupPage.emailExistsErrorMessage).toBeVisible();
    });
});
