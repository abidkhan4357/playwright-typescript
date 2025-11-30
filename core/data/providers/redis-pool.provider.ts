import Redis from 'ioredis';
import { TestDataProvider, PoolStats } from './test-data.provider';

export interface RedisPoolConfig {
    host: string;
    port: number;
    keyPrefix?: string;
    lockTtlSeconds?: number;
}

export class RedisPoolProvider implements TestDataProvider {
    private client: Redis;
    private readonly keyPrefix: string;
    private readonly lockTtl: number;
    private readonly workerId: string;

    constructor(config: RedisPoolConfig) {
        this.client = new Redis({
            host: config.host,
            port: config.port,
            lazyConnect: true,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) return null;
                return Math.min(times * 100, 1000);
            }
        });
        this.client.on('error', () => {});
        this.keyPrefix = config.keyPrefix || 'testdata';
        this.lockTtl = config.lockTtlSeconds || 300;
        this.workerId = `worker:${process.pid}:${Date.now()}`;
    }

    private getPoolKey(poolName: string): string {
        return `${this.keyPrefix}:${poolName}`;
    }

    private getProcessingKey(poolName: string): string {
        return `${this.keyPrefix}:${poolName}:processing:${this.workerId}`;
    }

    async acquire<T>(poolName: string): Promise<T | null> {
        const poolKey = this.getPoolKey(poolName);
        const processingKey = this.getProcessingKey(poolName);

        const data = await this.client.lmove(poolKey, processingKey, 'RIGHT', 'LEFT');

        if (!data) return null;

        await this.client.expire(processingKey, this.lockTtl);

        try {
            return JSON.parse(data) as T;
        } catch {
            return data as unknown as T;
        }
    }

    async release<T>(poolName: string, data: T): Promise<void> {
        const poolKey = this.getPoolKey(poolName);
        const processingKey = this.getProcessingKey(poolName);
        const serialized = JSON.stringify(data);

        await this.client.lrem(processingKey, 1, serialized);
        await this.client.lpush(poolKey, serialized);
    }

    async consume<T>(poolName: string): Promise<T | null> {
        const poolKey = this.getPoolKey(poolName);
        const data = await this.client.rpop(poolKey);

        if (!data) return null;

        try {
            return JSON.parse(data) as T;
        } catch {
            return data as unknown as T;
        }
    }

    async seed<T>(poolName: string, items: T[]): Promise<number> {
        if (items.length === 0) return 0;

        const poolKey = this.getPoolKey(poolName);
        const serialized = items.map(item => JSON.stringify(item));

        return await this.client.lpush(poolKey, ...serialized);
    }

    async getStats(poolName: string): Promise<PoolStats> {
        const poolKey = this.getPoolKey(poolName);
        const processingKey = this.getProcessingKey(poolName);

        const [available, processing] = await Promise.all([
            this.client.llen(poolKey),
            this.client.llen(processingKey)
        ]);

        return { available, processing };
    }

    async isAvailable(): Promise<boolean> {
        try {
            await this.client.connect();
            const pong = await this.client.ping();
            return pong === 'PONG';
        } catch {
            return false;
        }
    }

    async close(): Promise<void> {
        await this.client.quit();
    }

    async clear(poolName: string): Promise<void> {
        const poolKey = this.getPoolKey(poolName);
        const processingKey = this.getProcessingKey(poolName);

        await Promise.all([
            this.client.del(poolKey),
            this.client.del(processingKey)
        ]);
    }
}
