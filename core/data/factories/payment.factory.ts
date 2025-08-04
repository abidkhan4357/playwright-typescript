/**
 * Factory for generating payment test data
 */
export interface PaymentInfo {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
}

export type PaymentType = 'valid' | 'invalid' | 'expired';

export class PaymentFactory {
    /**
     * Generate payment information based on the specified type
     * @param type Type of payment information to generate
     * @returns Payment information
     */
    generate(type: PaymentType = 'valid'): PaymentInfo {
        switch (type) {
            case 'valid':
                return this.generateValidPayment();
            case 'invalid':
                return this.generateInvalidPayment();
            case 'expired':
                return this.generateExpiredPayment();
            default:
                return this.generateValidPayment();
        }
    }

    private generateValidPayment(): PaymentInfo {
        return {
            nameOnCard: 'John Smith',
            cardNumber: '4111111111111111',
            cvc: '123',
            expiryMonth: '12',
            expiryYear: '2030'
        };
    }

    //Examples of other payment types we can test
    private generateInvalidPayment(): PaymentInfo {
        return {
            nameOnCard: 'Invalid Card',
            cardNumber: '1234', 
            cvc: '12',
            expiryMonth: '13',
            expiryYear: '2030'
        };
    }

    private generateExpiredPayment(): PaymentInfo {
        return {
            nameOnCard: 'Expired Card',
            cardNumber: '4111111111111111',
            cvc: '123',
            expiryMonth: '12',
            expiryYear: '2020'
        };
    }
}
