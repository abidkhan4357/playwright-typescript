import { APIRequestContext, request } from '@playwright/test';
import { ConfigManager } from '../config/config.manager';

/**
 * Base API client for making HTTP requests
 * Provides wrapper methods for common HTTP operations
 */
export class ApiClient {
    protected request: APIRequestContext;
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

    async get(endpoint: string, params?: Record<string, string>): Promise<any> {
        const response = await this.request.get(endpoint, { params });
        return await this.handleResponse(response);
    }

    async post(endpoint: string, data?: Record<string, any>): Promise<any> {
        const response = await this.request.post(endpoint, { data });
        return await this.handleResponse(response);
    }

    async postForm(endpoint: string, formData: Record<string, any>): Promise<any> {
        const response = await this.request.post(endpoint, { 
            form: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            } 
        });
        return await this.handleResponse(response);
    }

    async put(endpoint: string, data?: Record<string, any>): Promise<any> {
        const response = await this.request.put(endpoint, { data });
        return await this.handleResponse(response);
    }

    async delete(endpoint: string, data?: Record<string, any>): Promise<any> {
        const response = await this.request.delete(endpoint, data ? { data } : undefined);
        return await this.handleResponse(response);
    }

    async deleteWithParams(endpoint: string, params?: Record<string, string | number>): Promise<any> {
        // Convert params to string values if needed
        const stringParams = params ? Object.fromEntries(
            Object.entries(params).map(([key, value]) => [key, String(value)])
        ) : undefined;
        
        console.log('DELETE params being sent:', params);
        
        // For the deleteAccount endpoint, the API expects form data
        const options: any = {};
        
        if (stringParams) {
            // Create a URLSearchParams object for form encoding
            const formData = new URLSearchParams();
            for (const [key, value] of Object.entries(stringParams)) {
                formData.append(key, value);
            }
            
            // Set the options with form data and proper content type
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            options.data = formData.toString();
        }
        
        const response = await this.request.delete(endpoint, options);
        return await this.handleResponse(response);
    }

    protected async handleResponse(response: any): Promise<any> {
        try {
            if (response.status() >= 200 && response.status() < 300) {
                // For successful responses, try to parse the body
                const contentType = response.headers()['content-type'] || '';
                if (contentType.includes('application/json')) {
                    const jsonBody = await response.json();
                    return {
                        status: response.status(),
                        body: JSON.stringify(jsonBody)
                    };
                } else {
                    // Handle text or other response types
                    const textBody = await response.text();
                    return {
                        status: response.status(),
                        body: textBody
                    };
                }
            } else {
                // For error responses
                return {
                    status: response.status(),
                    body: await response.text()
                };
            }
        } catch (error) {
            console.error('Error handling API response:', error);
            return {
                status: response.status(),
                error: `Failed to process response: ${error}`
            };
        }
    }
}
