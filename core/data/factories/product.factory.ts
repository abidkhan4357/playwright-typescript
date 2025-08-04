import { ApiClient } from '../../api/api.client';

export interface Product {
    id: number;
    name: string;
    price: string;
    brand: string;
    category: {
        usertype: {
            usertype: string;
        };
        category: string;
    };
}

export class ProductFactory {
    private products: Product[] = [];
    private initialized: boolean = false;
    private apiClient: ApiClient;
    
    constructor() {
        this.apiClient = new ApiClient();
    }
    
    async getAllProductListByApi(): Promise<Product[]> {
        if (this.initialized) return this.products;
        
        await this.apiClient.init();
        
        const response = await this.apiClient.get('productsList');
        
        if (response.body && typeof response.body === 'string') {
            const parsedBody = JSON.parse(response.body);
            
            if (parsedBody.responseCode === 200 && parsedBody.products) {
                this.products = parsedBody.products;
                this.initialized = true;
                return this.products;
            }
        }
        
        throw new Error('Could not retrieve products from API');
    }
}
