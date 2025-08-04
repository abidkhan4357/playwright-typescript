import { test, expect } from '@playwright/test';
import { UserService } from '../../core/api/services/user.service';
import { UserFactory } from '../../core/data/factories/user.factory';

test.describe('Login API Tests', () => {
    let userService: UserService;
    const userFactory = new UserFactory();
    
    test.beforeEach(async () => {
        userService = new UserService();
        await userService.init();
    });
    
    test('should successfully login with valid credentials', async () => {
        const testUser = userFactory.generate('validUser');
        
        const response = await userService.login({
            email: testUser.email,
            password: testUser.password
        });
        
        const responseData = JSON.parse(response.body);
        expect(responseData.responseCode).toBe(200);
        expect(responseData.message).toBe('User exists!');
    });
    
    test('should return error for invalid credentials', async () => {
        const invalidUser = userFactory.generate('invalidEmailAndPassword');
        
        const response = await userService.login({
            email: invalidUser.email,
            password: invalidUser.password
        });
        
        const responseData = JSON.parse(response.body);
        expect(responseData.responseCode).toBe(404);
        expect(responseData.message).toBe('User not found!');
    });
    
    test('should return error for empty email', async () => {
        const response = await userService.login({
            email: '',
            password: 'password123'
        });
        
        const responseData = JSON.parse(response.body);
        expect(responseData.responseCode).toBe(404);
        expect(responseData.message).toBe('User not found!');
    });
    
    test('should return error for empty password', async () => {
        const testUser = userFactory.generate('validUser');
        
        const response = await userService.login({
            email: testUser.email,
            password: ''
        });
        
        const responseData = JSON.parse(response.body);
        expect(responseData.responseCode).toBe(404);
        expect(responseData.message).toBe('User not found!');
    });
});
