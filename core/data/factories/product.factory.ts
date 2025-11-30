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

interface ProductListResponse {
    responseCode: number;
    products: Product[];
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

        const response = await this.apiClient.get<ProductListResponse>('productsList');

        if (response.data.responseCode === 200 && response.data.products) {
            this.products = response.data.products;
            this.initialized = true;
            return this.products;
        }

        throw new Error('Could not retrieve products from API');
    }
}
