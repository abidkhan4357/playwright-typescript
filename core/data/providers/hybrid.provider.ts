import { TestDataProvider, PoolStats } from './test-data.provider';
import { RedisPoolProvider, RedisPoolConfig } from './redis-pool.provider';
import { ApiFactoryProvider } from './api-factory.provider';

export class HybridProvider implements TestDataProvider {
    private redisProvider: RedisPoolProvider;
    private apiProvider: ApiFactoryProvider;
    private redisAvailable: boolean = false;
    private initialized: boolean = false;

    constructor(redisConfig: RedisPoolConfig) {
        this.redisProvider = new RedisPoolProvider(redisConfig);
        this.apiProvider = new ApiFactoryProvider();
    }

    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return;

        this.redisAvailable = await this.redisProvider.isAvailable();
        this.initialized = true;

        if (this.redisAvailable) {
            console.log('[HybridProvider] Redis connected - using pool-based data');
        } else {
            console.log('[HybridProvider] Redis unavailable - falling back to API factory');
        }
    }

    async acquire<T>(poolName: string): Promise<T | null> {
        await this.ensureInitialized();

        if (this.redisAvailable) {
            const data = await this.redisProvider.acquire<T>(poolName);
            if (data) {
                console.log(`[HybridProvider] Acquired from Redis pool: ${poolName}`);
                return data;
            }
            console.log(`[HybridProvider] Redis pool empty, falling back to API: ${poolName}`);
        }

        const data = await this.apiProvider.acquire<T>(poolName);
        if (data) {
            console.log(`[HybridProvider] Created via API: ${poolName}`);
        }
        return data;
    }

    async consume<T>(poolName: string): Promise<T | null> {
        await this.ensureInitialized();

        if (this.redisAvailable) {
            const data = await this.redisProvider.consume<T>(poolName);
            if (data) {
                return data;
            }
        }

        return this.apiProvider.consume<T>(poolName);
    }

    async release<T>(poolName: string, data: T): Promise<void> {
        await this.ensureInitialized();

        if (this.redisAvailable) {
            await this.redisProvider.release(poolName, data);
        }
    }

    async transfer<T>(fromPool: string, toPool: string, data: T): Promise<void> {
        await this.ensureInitialized();

        if (this.redisAvailable) {
            await this.redisProvider.transfer(fromPool, toPool, data);
        }
    }

    async getStats(poolName: string): Promise<PoolStats> {
        await this.ensureInitialized();

        if (this.redisAvailable) {
            return this.redisProvider.getStats(poolName);
        }
        return this.apiProvider.getStats(poolName);
    }

    async isAvailable(): Promise<boolean> {
        await this.ensureInitialized();
        return true;
    }

    async close(): Promise<void> {
        if (this.redisAvailable) {
            await this.redisProvider.close();
        }
        await this.apiProvider.close();
    }

    isRedisConnected(): boolean {
        return this.redisAvailable;
    }

    getRedisProvider(): RedisPoolProvider {
        return this.redisProvider;
    }
}
