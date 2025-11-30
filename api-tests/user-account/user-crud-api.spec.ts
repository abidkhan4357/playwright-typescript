import { test, expect } from '@playwright/test';
import { UserService, CreateUserRequest } from '../../core/api/services/user.service';
import { UserFactory } from '../../core/data/factories/user.factory';

test.describe('User Account CRUD API Tests', () => {
    let userService: UserService;
    const userFactory = new UserFactory();
    let testUserEmail: string;
    let testUserPassword: string;

    test.beforeEach(async () => {
        userService = new UserService();
        await userService.init();
    });

    test.afterEach(async () => {
        if (testUserEmail && testUserPassword) {
            try {
                await userService.deleteAccount(testUserEmail, testUserPassword);
                testUserEmail = '';
                testUserPassword = '';
            } catch {
                // Ignore cleanup errors
            }
        }
    });

    function buildUserData(user: ReturnType<typeof userFactory.generate>): CreateUserRequest {
        return {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email!,
            password: user.password!,
            title: 'Mr',
            birth_date: '1',
            birth_month: '1',
            birth_year: '1990',
            firstname: user.firstName!,
            lastname: user.lastName!,
            company: 'Test Company',
            address1: user.address?.street || '123 Test St',
            address2: 'Apt 101',
            country: 'United States',
            state: user.address?.state || 'NY',
            city: user.address?.city || 'New York',
            zipcode: user.address?.zipCode || '10001',
            mobile_number: user.phone || '1234567890'
        };
    }

    test('should create a new user account', async () => {
        const newUser = userFactory.generate('randomUser');
        testUserEmail = newUser.email!;
        testUserPassword = newUser.password!;

        const response = await userService.createUser(buildUserData(newUser));

        expect(response.data.responseCode).toBe(201);
        expect(response.data.message).toBe('User created!');
    });

    test('should verify login with created account', async () => {
        const newUser = userFactory.generate('randomUser');
        testUserEmail = newUser.email!;
        testUserPassword = newUser.password!;

        const createResponse = await userService.createUser(buildUserData(newUser));
        expect(createResponse.data.responseCode).toBe(201);

        const loginResponse = await userService.login({
            email: testUserEmail,
            password: testUserPassword
        });

        expect(loginResponse.data.responseCode).toBe(200);
        expect(loginResponse.data.message).toBe('User exists!');
    });

    test('should return error when creating user with existing email', async () => {
        const existingUser = userFactory.generate('randomUser');
        testUserEmail = existingUser.email!;
        testUserPassword = existingUser.password!;

        const userData = buildUserData(existingUser);

        const firstResponse = await userService.createUser(userData);
        expect(firstResponse.data.responseCode).toBe(201);

        const secondResponse = await userService.createUser(userData);
        expect(secondResponse.data.responseCode).toBe(400);
        expect(secondResponse.data.message).toBe('Email already exists!');
    });

    test('should delete a user account', async () => {
        const newUser = userFactory.generate('randomUser');
        testUserEmail = newUser.email!;
        testUserPassword = newUser.password!;

        const createResponse = await userService.createUser(buildUserData(newUser));
        expect(createResponse.data.responseCode).toBe(201);

        const deleteResponse = await userService.deleteAccount(testUserEmail, testUserPassword);
        expect(deleteResponse.data.responseCode).toBe(200);
        expect(deleteResponse.data.message).toBe('Account deleted!');

        testUserEmail = '';
        testUserPassword = '';

        const loginResponse = await userService.login({
            email: newUser.email!,
            password: newUser.password!
        });

        expect(loginResponse.data.responseCode).toBe(404);
        expect(loginResponse.data.message).toBe('User not found!');
    });

    test('should fail to delete non-existent account', async () => {
        const nonExistentUser = userFactory.generate('randomUser');

        const deleteResponse = await userService.deleteAccount(
            nonExistentUser.email!,
            nonExistentUser.password!
        );

        expect(deleteResponse.data.responseCode).toBe(404);
        expect(deleteResponse.data.message).toBe('Account not found!');
    });
});
