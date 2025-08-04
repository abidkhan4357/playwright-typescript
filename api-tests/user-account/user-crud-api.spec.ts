import { test, expect } from '@playwright/test';
import { UserService } from '../../core/api/services/user.service';
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
            } catch (error) {
                // Ignore cleanup errors
            }
        }
    });
    
    test('should create a new user account', async () => {
        const newUser = userFactory.generate('randomUser');
        testUserEmail = newUser.email;
        testUserPassword = newUser.password;
        
        const userData = {
            name: `${newUser.firstName} ${newUser.lastName}`,
            email: testUserEmail,
            password: testUserPassword,
            title: 'Mr',
            birth_day: '1',
            birth_month: '1',
            birth_year: '1990',
            firstname: newUser.firstName,
            lastname: newUser.lastName,
            company: 'Test Company',
            address1: newUser.address?.street || '123 Test St',
            address2: 'Apt 101',
            country: 'United States',
            state: newUser.address?.state || 'NY',
            city: newUser.address?.city || 'New York',
            zipcode: newUser.address?.zipCode || '10001',
            mobile_number: newUser.phone || '1234567890'
        };
        
        const response = await userService.createUser(userData);
        
        const responseData = JSON.parse(response.body);
        expect(responseData.responseCode).toBe(201);
        expect(responseData.message).toBe('User created!');
    });
    
    test('should verify login with created account', async () => {
        const newUser = userFactory.generate('randomUser');
        testUserEmail = newUser.email;
        testUserPassword = newUser.password;
        
        const userData = {
            name: `${newUser.firstName} ${newUser.lastName}`,
            email: testUserEmail,
            password: testUserPassword,
            title: 'Mr',
            birth_day: '1',
            birth_month: '1',
            birth_year: '1990',
            firstname: newUser.firstName,
            lastname: newUser.lastName,
            company: 'Test Company',
            address1: newUser.address?.street || '123 Test St',
            address2: 'Apt 101',
            country: 'United States',
            state: newUser.address?.state || 'NY',
            city: newUser.address?.city || 'New York',
            zipcode: newUser.address?.zipCode || '10001',
            mobile_number: newUser.phone || '1234567890'
        };
        
        const createResponse = await userService.createUser(userData);
        const createData = JSON.parse(createResponse.body);
        
        if (createData.responseCode !== 201) {
            expect(createData.responseCode).toBe(201);
            return;
        }
        
        const loginResponse = await userService.login({
            email: testUserEmail,
            password: testUserPassword
        });
        
        const loginData = JSON.parse(loginResponse.body);
        expect(loginData.responseCode).toBe(200);
        expect(loginData.message).toBe('User exists!');
    });
    
    test('should return error when creating user with existing email', async () => {
        const existingUser = userFactory.generate('randomUser');
        testUserEmail = existingUser.email;
        testUserPassword = existingUser.password;
        
        const userData = {
            name: `${existingUser.firstName} ${existingUser.lastName}`,
            email: testUserEmail,
            password: testUserPassword,
            title: 'Mr',
            birth_day: '1',
            birth_month: '1',
            birth_year: '1990',
            firstname: existingUser.firstName,
            lastname: existingUser.lastName,
            company: 'Test Company',
            address1: existingUser.address?.street || '123 Test St',
            address2: 'Apt 101',
            country: 'United States',
            state: existingUser.address?.state || 'NY',
            city: existingUser.address?.city || 'New York',
            zipcode: existingUser.address?.zipCode || '10001',
            mobile_number: existingUser.phone || '1234567890'
        };
        
        const firstResponse = await userService.createUser(userData);
        const firstData = JSON.parse(firstResponse.body);
        
        if (firstData.responseCode !== 201) {
            expect(firstData.responseCode).toBe(201);
            return;
        }
        
        const secondResponse = await userService.createUser(userData);
        
        const secondData = JSON.parse(secondResponse.body);
        expect(secondData.responseCode).toBe(400);
        expect(secondData.message).toBe('Email already exists!');
    });
    
    test('should delete a user account', async () => {
        const newUser = userFactory.generate('randomUser');
        testUserEmail = newUser.email;
        testUserPassword = newUser.password;
        
        const userData = {
            name: `${newUser.firstName} ${newUser.lastName}`,
            email: testUserEmail,
            password: testUserPassword,
            title: 'Mr',
            birth_day: '1',
            birth_month: '1',
            birth_year: '1990',
            firstname: newUser.firstName,
            lastname: newUser.lastName,
            company: 'Test Company',
            address1: newUser.address?.street || '123 Test St',
            address2: 'Apt 101',
            country: 'United States',
            state: newUser.address?.state || 'NY',
            city: newUser.address?.city || 'New York',
            zipcode: newUser.address?.zipCode || '10001',
            mobile_number: newUser.phone || '1234567890'
        };
        
        const createResponse = await userService.createUser(userData);
        const createData = JSON.parse(createResponse.body);
        
        if (createData.responseCode !== 201) {
            expect(createData.responseCode).toBe(201);
            return;
        }
        
        const deleteResponse = await userService.deleteAccount(testUserEmail, testUserPassword);
        
        const deleteData = JSON.parse(deleteResponse.body);
        expect(deleteData.responseCode).toBe(200);
        expect(deleteData.message).toBe('Account deleted!');
        
        testUserEmail = '';
        testUserPassword = '';
        
        const loginResponse = await userService.login({
            email: newUser.email,
            password: newUser.password
        });
        
        const loginData = JSON.parse(loginResponse.body);
        expect(loginData.responseCode).toBe(404);
        expect(loginData.message).toBe('User not found!');
    });
    
    test('should fail to delete non-existent account', async () => {
        const nonExistentUser = userFactory.generate('randomUser');
        
        const deleteResponse = await userService.deleteAccount(
            nonExistentUser.email, 
            nonExistentUser.password
        );
        
        const deleteData = JSON.parse(deleteResponse.body);
        expect(deleteData.responseCode).toBe(404);
        expect(deleteData.message).toBe('Account not found!');
    });
});
