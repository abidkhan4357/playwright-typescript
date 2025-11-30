import { RedisPoolProvider, PoolName, TestUser } from '../core/data/providers';
import { UserFactory } from '../core/data/factories/user.factory';
import { UserService, CreateUserRequest } from '../core/api/services/user.service';

interface SeedConfig {
    poolName: PoolName;
    targetCount: number;
    createRegistered: boolean;
}

const SEED_CONFIGS: SeedConfig[] = [
    { poolName: PoolName.USERS_FRESH, targetCount: 20, createRegistered: false },
    { poolName: PoolName.USERS_REGISTERED, targetCount: 10, createRegistered: true }
];

async function seedPool(
    provider: RedisPoolProvider,
    userService: UserService,
    userFactory: UserFactory,
    config: SeedConfig
): Promise<number> {
    const stats = await provider.getStats(config.poolName);
    const needed = config.targetCount - stats.available;

    if (needed <= 0) {
        console.log(`[${config.poolName}] Already has ${stats.available} items, skipping`);
        return 0;
    }

    console.log(`[${config.poolName}] Seeding ${needed} items...`);

    const users: TestUser[] = [];

    for (let i = 0; i < needed; i++) {
        const user = userFactory.generate('randomUser');

        const testUser: TestUser = {
            email: user.email!,
            password: user.password!,
            firstName: user.firstName,
            lastName: user.lastName
        };

        if (config.createRegistered) {
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

            try {
                const response = await userService.createUser(createRequest);
                if (response.data.responseCode === 201) {
                    users.push(testUser);
                    console.log(`  Created registered user: ${testUser.email}`);
                } else {
                    console.log(`  Failed to register: ${testUser.email} - ${response.data.message}`);
                }
            } catch (error) {
                console.log(`  Error creating user: ${testUser.email}`);
            }
        } else {
            users.push(testUser);
        }
    }

    if (users.length > 0) {
        await provider.seed(config.poolName, users);
        console.log(`[${config.poolName}] Seeded ${users.length} items`);
    }

    return users.length;
}

async function main(): Promise<void> {
    console.log('=== Redis Pool Seeding ===\n');

    const provider = new RedisPoolProvider({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
    });

    const isConnected = await provider.isAvailable();
    if (!isConnected) {
        console.error('Cannot connect to Redis. Is it running?');
        console.log('Start Redis with: docker-compose up -d redis');
        process.exit(1);
    }

    const userFactory = new UserFactory();
    const userService = new UserService();
    await userService.init();

    let totalSeeded = 0;

    for (const config of SEED_CONFIGS) {
        const seeded = await seedPool(provider, userService, userFactory, config);
        totalSeeded += seeded;
    }

    console.log(`\n=== Seeding Complete: ${totalSeeded} total items ===\n`);

    for (const config of SEED_CONFIGS) {
        const stats = await provider.getStats(config.poolName);
        console.log(`${config.poolName}: ${stats.available} available`);
    }

    await provider.close();
}

main().catch(console.error);
