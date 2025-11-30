import { RedisPoolProvider, PoolName, TestUser } from '../core/data/providers';
import { UserFactory } from '../core/data/factories/user.factory';
import { UserService, CreateUserRequest } from '../core/api/services/user.service';

interface SeedConfig {
    poolName: PoolName;
    targetCount: number;
    minThreshold: number;
    createRegistered: boolean;
}

const SEED_CONFIGS: SeedConfig[] = [
    { poolName: PoolName.USERS_FRESH, targetCount: 50, minThreshold: 10, createRegistered: false },
    { poolName: PoolName.USERS_REGISTERED, targetCount: 20, minThreshold: 5, createRegistered: true }
];

async function seedPool(
    provider: RedisPoolProvider,
    userService: UserService,
    userFactory: UserFactory,
    config: SeedConfig,
    force: boolean
): Promise<number> {
    const stats = await provider.getStats(config.poolName);

    if (!force && stats.available >= config.minThreshold) {
        console.log(`[${config.poolName}] Has ${stats.available} items (threshold: ${config.minThreshold}), skipping`);
        return 0;
    }

    const needed = config.targetCount - stats.available;
    if (needed <= 0) {
        console.log(`[${config.poolName}] Already at target (${stats.available}/${config.targetCount})`);
        return 0;
    }

    console.log(`[${config.poolName}] Seeding ${needed} items (current: ${stats.available}, target: ${config.targetCount})...`);

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
                    process.stdout.write('.');
                } else {
                    process.stdout.write('x');
                }
            } catch {
                process.stdout.write('x');
            }
        } else {
            users.push(testUser);
        }
    }

    if (config.createRegistered) {
        console.log();
    }

    if (users.length > 0) {
        await provider.seed(config.poolName, users);
        console.log(`[${config.poolName}] Seeded ${users.length} items`);
    }

    return users.length;
}

async function main(): Promise<void> {
    const force = process.argv.includes('--force');

    console.log('=== Redis Pool Seeding ===\n');
    if (force) {
        console.log('Force mode: Seeding to target regardless of threshold\n');
    }

    const provider = new RedisPoolProvider({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
    });

    const isConnected = await provider.isAvailable();
    if (!isConnected) {
        console.error('Cannot connect to Redis. Is it running?');
        console.log('Start Redis with: npm run redis:start');
        process.exit(1);
    }

    const userFactory = new UserFactory();
    const userService = new UserService();
    await userService.init();

    let totalSeeded = 0;

    for (const config of SEED_CONFIGS) {
        const seeded = await seedPool(provider, userService, userFactory, config, force);
        totalSeeded += seeded;
    }

    console.log(`\n=== Summary ===\n`);
    console.log(`Seeded: ${totalSeeded} items\n`);

    for (const config of SEED_CONFIGS) {
        const stats = await provider.getStats(config.poolName);
        const status = stats.available < config.minThreshold ? '⚠️ LOW' : '✓';
        console.log(`${config.poolName}: ${stats.available} available ${status}`);
    }

    await provider.close();
}

main().catch(console.error);
