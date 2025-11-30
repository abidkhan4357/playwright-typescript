import Redis from 'ioredis';

const KEY_PREFIX = 'testdata:';
const STALE_THRESHOLD_SECONDS = 600;

async function cleanupPools(): Promise<void> {
    const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 3
    });

    redis.on('error', () => {});

    try {
        await redis.ping();
        console.log('=== Redis Pool Cleanup ===\n');

        const allKeys = await redis.keys(`${KEY_PREFIX}*`);
        const processingKeys = allKeys.filter(k => k.includes(':processing:'));

        if (processingKeys.length === 0) {
            console.log('No stale processing queues found.\n');
        } else {
            console.log(`Found ${processingKeys.length} processing queues to check...\n`);

            for (const key of processingKeys) {
                const ttl = await redis.ttl(key);
                const length = await redis.llen(key);

                if (length === 0) {
                    await redis.del(key);
                    console.log(`  Deleted empty: ${key}`);
                } else if (ttl === -1) {
                    const poolName = key.replace(KEY_PREFIX, '').split(':processing:')[0];
                    const poolKey = `${KEY_PREFIX}${poolName}`;

                    const items = await redis.lrange(key, 0, -1);
                    if (items.length > 0) {
                        await redis.lpush(poolKey, ...items);
                        await redis.del(key);
                        console.log(`  Recovered ${items.length} items from stale queue: ${key}`);
                    }
                } else {
                    console.log(`  Active (TTL: ${ttl}s): ${key} - ${length} items`);
                }
            }
        }

        console.log('\n--- Pool Status After Cleanup ---\n');

        const poolKeys = allKeys.filter(k => !k.includes(':processing:'));
        for (const key of poolKeys.sort()) {
            const count = await redis.llen(key);
            const poolName = key.replace(KEY_PREFIX, '');
            console.log(`  ${poolName}: ${count} available`);
        }

        console.log('\n=== Cleanup Complete ===');

    } catch (error) {
        if ((error as any).code === 'ECONNREFUSED') {
            console.error('Cannot connect to Redis. Is it running?');
        } else {
            console.error('Error:', error);
        }
    } finally {
        await redis.quit();
    }
}

cleanupPools();
