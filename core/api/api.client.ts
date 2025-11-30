import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { ConfigManager } from '../config/config.manager';

export interface ApiResponse<T = unknown> {
    status: number;
    data: T;
}

export class ApiClient {
    protected request!: APIRequestContext;
    protected config: ConfigManager;
    protected baseUrl: string;

    constructor() {
        this.config = ConfigManager.getInstance();
        this.baseUrl = this.config.apiBaseUrl;
    }

    async init(): Promise<void> {
        this.request = await request.newContext({
            baseURL: this.baseUrl,
            extraHTTPHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    }

    async get<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
        const response = await this.request.get(endpoint, { params });
        return this.handleResponse<T>(response);
    }

    async post<T = unknown>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
        const response = await this.request.post(endpoint, { data });
        return this.handleResponse<T>(response);
    }

    async postForm<T = unknown>(endpoint: string, formData: Record<string, unknown>): Promise<ApiResponse<T>> {
        const form: Record<string, string | number | boolean> = {};
        for (const [key, value] of Object.entries(formData)) {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                form[key] = value;
            } else if (value !== null && value !== undefined) {
                form[key] = String(value);
            }
        }
        const response = await this.request.post(endpoint, {
            form,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return this.handleResponse<T>(response);
    }

    async put<T = unknown>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
        const response = await this.request.put(endpoint, { data });
        return this.handleResponse<T>(response);
    }

    async delete<T = unknown>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
        const response = await this.request.delete(endpoint, data ? { data } : undefined);
        return this.handleResponse<T>(response);
    }

    async deleteForm<T = unknown>(endpoint: string, formData: Record<string, string | number>): Promise<ApiResponse<T>> {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(formData)) {
            params.append(key, String(value));
        }

        const response = await this.request.delete(endpoint, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: params.toString()
        });
        return this.handleResponse<T>(response);
    }

    protected async handleResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
        const text = await response.text();
        let data: T;

        try {
            data = JSON.parse(text) as T;
        } catch {
            data = text as unknown as T;
        }

        return {
            status: response.status(),
            data
        };
    }
}
