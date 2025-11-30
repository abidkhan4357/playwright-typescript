import { ApiClient, ApiResponse } from '../api.client';
import { LoginRequest } from '../../models/user.model';

export interface AutomationExerciseResponse {
    responseCode: number;
    message: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    title: string;
    birth_date: string;
    birth_month: string;
    birth_year: string;
    firstname: string;
    lastname: string;
    company?: string;
    address1: string;
    address2?: string;
    country: string;
    zipcode: string;
    state: string;
    city: string;
    mobile_number: string;
}

export class UserService extends ApiClient {
    async login(loginData: LoginRequest): Promise<ApiResponse<AutomationExerciseResponse>> {
        return this.postForm<AutomationExerciseResponse>('verifyLogin', loginData as unknown as Record<string, unknown>);
    }

    async createUser(userData: CreateUserRequest): Promise<ApiResponse<AutomationExerciseResponse>> {
        return this.postForm<AutomationExerciseResponse>('createAccount', userData as unknown as Record<string, unknown>);
    }

    async deleteAccount(email: string, password: string): Promise<ApiResponse<AutomationExerciseResponse>> {
        return this.deleteForm<AutomationExerciseResponse>('deleteAccount', { email, password });
    }

    async getUserByEmail(email: string): Promise<ApiResponse<AutomationExerciseResponse>> {
        return this.get<AutomationExerciseResponse>('getUserDetailByEmail', { email });
    }
}
