/**
 * Interface for login request payload
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Interface for user account data
 */
export interface UserAccount {
    id?: string;
    name?: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    phone?: string;
    address?: Address;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Interface for address information
 */
export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

/**
 * Interface for API response containing user data
 */
export interface UserResponse {
    success: boolean;
    message: string;
    user?: UserAccount;
    token?: string;
    error?: string;
    // Additional properties that may be returned from non-JSON responses
    body?: string;
    status?: number;
    statusText?: string;
}
