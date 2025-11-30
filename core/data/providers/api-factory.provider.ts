import { TestDataProvider, PoolStats, TestUser } from './test-data.provider';
import { UserFactory } from '../factories/user.factory';
import { UserService, CreateUserRequest } from '../../api/services/user.service';

export class ApiFactoryProvider implements TestDataProvider {
    private userFactory: UserFactory;
    private userService: UserService | null = null;

    constructor() {
        this.userFactory = new UserFactory();
    }

    private async getUserService(): Promise<UserService> {
        if (!this.userService) {
            this.userService = new UserService();
            await this.userService.init();
        }
        return this.userService;
    }

    async acquire<T>(poolName: string): Promise<T | null> {
        if (poolName.includes('fresh')) {
            const user = this.userFactory.generate('randomUser');
            return {
                email: user.email,
                password: user.password,
                firstName: user.firstName,
                lastName: user.lastName
            } as unknown as T;
        }

        if (poolName.includes('registered')) {
            const user = this.userFactory.generate('randomUser');
            const service = await this.getUserService();

            const createRequest: CreateUserRequest = {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email!,
                password: user.password!,
                title: 'Mr',
                birth_date: '1',
                birth_month: '1',
                birth_year: '1990',
                firstname: user.firstName!,
                lastname: user.lastName!,
                address1: user.address?.street || '123 Test St',
                country: 'United States',
                state: user.address?.state || 'NY',
                city: user.address?.city || 'New York',
                zipcode: user.address?.zipCode || '10001',
                mobile_number: user.phone || '1234567890'
            };

            const response = await service.createUser(createRequest);

            if (response.data.responseCode === 201) {
                return {
                    email: user.email,
                    password: user.password,
                    firstName: user.firstName,
                    lastName: user.lastName
                } as unknown as T;
            }

            return null;
        }

        return null;
    }

    async release<T>(_poolName: string, _data: T): Promise<void> {
        // API provider doesn't maintain pools - data is ephemeral
    }

    async getStats(_poolName: string): Promise<PoolStats> {
        return { available: Infinity, processing: 0 };
    }

    async isAvailable(): Promise<boolean> {
        return true;
    }

    async close(): Promise<void> {
        // Nothing to close
    }
}
