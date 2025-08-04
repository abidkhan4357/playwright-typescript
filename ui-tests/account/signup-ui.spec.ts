import { test, expect } from '../../core/fixtures/page.fixture';
import { UserFactory } from '../../core/data/factories/user.factory';

test.describe('Signup feature tests', () => {
    const userFactory = new UserFactory();
    let testUserEmail: string;
    let testUserPassword: string;
    
    test.beforeEach(async ({ signupPage }) => {
        await signupPage.navigateToSignupPage();
    });
    
    // Leverage api for cleanup of created test users after each test
    test.afterEach(async ({ userService }) => {
        if (testUserEmail && testUserPassword) {
            console.log(`Cleaning up test user: ${testUserEmail}`);
            try {
                const deleteResponse = await userService.deleteAccount(testUserEmail, testUserPassword);
                // Parse response if needed
                if (deleteResponse.body) {
                    const responseData = JSON.parse(deleteResponse.body);
                    console.log(`Cleanup response: ${responseData.message}`);
                } else {
                    console.log('User deletion completed');
                }
            } catch (error) {
                console.error(`Failed to delete test user: ${error}`);
            }
            
            // Reset the variables for next test
            testUserEmail = '';
            testUserPassword = '';
        }
    });

    test('should successfully create a new account with valid information', async ({ signupPage }) => {
        // Get a random user with valid data
        const newUser = userFactory.generate('randomUser');
        
        testUserEmail = newUser.email;
        testUserPassword = newUser.password;
        
        await signupPage.signupNewUser(newUser);
        await signupPage.assertAccountCreatedSuccessfully();
    });

    test('should show error message when trying to signup with existing email', async ({ signupPage, userService }) => {
        const apiTestUser = userFactory.generate('randomUser');
        
        testUserEmail = apiTestUser.email;
        testUserPassword = apiTestUser.password;
        
        // Using API to create user first to ensure the email exists in the application
        const apiResponse = await userService.createUser({
            name: `${apiTestUser.firstName} ${apiTestUser.lastName}`,
            email: testUserEmail,
            password: testUserPassword,
            title: 'Mr',
            birth_date: '10',
            birth_month: '5',
            birth_year: '1990',
            firstname: apiTestUser.firstName,
            lastname: apiTestUser.lastName,
            company: 'Test Company',
            address1: apiTestUser.address?.street || '123 Test St',
            address2: 'Apt 1',
            country: 'United States',
            zipcode: apiTestUser.address?.zipCode || '12345',
            state: apiTestUser.address?.state || 'NY',
            city: apiTestUser.address?.city || 'New York',
            mobile_number: apiTestUser.phone || '5551234567'
        });
        
        let responseData = JSON.parse(apiResponse.body);
        expect(responseData.responseCode).toBe(201);
        expect(responseData.message).toBe('User created!');
      
        // Register with same email via UI
        const fullName = `${apiTestUser.firstName} ${apiTestUser.lastName}`;
        await signupPage.enterInitialSignupInfo(fullName, apiTestUser.email);
        await signupPage.assertEmailAlreadyExists();
    });

});
