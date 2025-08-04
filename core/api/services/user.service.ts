import { ApiClient } from '../api.client';
import { LoginRequest, UserResponse } from '../../models/user.model';

/**
 * User API service for login and user management operations
 * Provides methods for all user-related API calls
 */
export class UserService extends ApiClient {
    /**
     * Verify user login
     * @param loginData - Login credentials
     * @returns API response
     */
    async login(loginData: LoginRequest): Promise<UserResponse> {
        return this.postForm('verifyLogin', loginData);
    }

    /**
     * Get user account details
     * @param userId - User ID
     * @returns User details
     */
    async getUserDetails(userId: string): Promise<UserResponse> {
        return this.get(`user/${userId}`);
    }

    /**
     * Create new user account
     * @param userData - User registration data
     * @returns Created user
     */
    async createUser(userData: any): Promise<UserResponse> {
        return this.postForm('createAccount', userData);
    }

    /**
     * Update user information
     * @param userId - User ID
     * @param userData - Updated user data
     * @returns Updated user
     */
    async updateUser(userId: string, userData: any): Promise<UserResponse> {
        return this.put(`user/${userId}`, userData);
    }

    /**
     * Delete user account
     * @param userId - User ID
     * @returns Delete confirmation
     */
    async deleteUser(userId: string): Promise<any> {
        return this.delete(`user/${userId}`);
    }

    /**
     * Delete account using email and password
     * @param email - User email
     * @param password - User password
     * @returns Delete confirmation
     */
    async deleteAccount(email: string, password: string): Promise<any> {
        // Using deleteWithParams to send parameters as query params, not in body
        return this.deleteWithParams('deleteAccount', { email, password });
    }
}
