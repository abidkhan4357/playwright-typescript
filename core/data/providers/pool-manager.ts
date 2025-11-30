import { ConfigManager } from '../../config/config.manager';
import { HybridProvider } from './hybrid.provider';
import { TestDataProvider, TestUser, PoolName, PoolStats } from './test-data.provider';

export class PoolManager {
    private static instance: PoolManager;
    private provider: TestDataProvider;
    private config: ConfigManager;

    private constructor() {
        this.config = ConfigManager.getInstance();
        const redisConfig = this.config.redisConfig;

        this.provider = new HybridProvider({
            host: redisConfig.host,
            port: redisConfig.port
        });
    }

    static getInstance(): PoolManager {
        if (!PoolManager.instance) {
            PoolManager.instance = new PoolManager();
        }
        return PoolManager.instance;
    }

    async acquireUser(poolName: PoolName = PoolName.USERS_REGISTERED): Promise<TestUser | null> {
        return this.provider.acquire<TestUser>(poolName);
    }

    async consumeUser(poolName: PoolName = PoolName.USERS_FRESH): Promise<TestUser | null> {
        return this.provider.consume<TestUser>(poolName);
    }

    async releaseUser(poolName: PoolName, user: TestUser): Promise<void> {
        await this.provider.release(poolName, user);
    }

    async transferUser(fromPool: PoolName, toPool: PoolName, user: TestUser): Promise<void> {
        await this.provider.transfer(fromPool, toPool, user);
    }

    async getStats(poolName: PoolName): Promise<PoolStats> {
        return this.provider.getStats(poolName);
    }

    async close(): Promise<void> {
        await this.provider.close();
        PoolManager.instance = undefined as unknown as PoolManager;
    }

    getProvider(): TestDataProvider {
        return this.provider;
    }
}
