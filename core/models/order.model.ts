/**
 * Interface for payment information
 */
export interface PaymentInfo {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
}

/**
 * Interface for product information
 */
export interface ProductInfo {
    id?: string;
    name?: string;
    price?: string;
    quantity?: number;
    category?: string;
}

/**
 * Interface for order data
 */
export interface OrderData {
    products: ProductInfo[];
    paymentInfo: PaymentInfo;
    comment?: string;
}

/**
 * Interface for API order response
 */
export interface OrderResponse {
    success: boolean;
    message: string;
    orderId?: string;
    error?: string;
    status?: number;
    statusText?: string;
    body?: string;
}
