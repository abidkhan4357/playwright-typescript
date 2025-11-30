import Redis from 'ioredis';

const KEY_PREFIX = 'testdata:';

async function showPoolStatus(): Promise<void> {
    const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 3
    });

    redis.on('error', () => {});

    try {
        await redis.ping();
        console.log('✓ Connected to Redis\n');

        const allKeys = await redis.keys(`${KEY_PREFIX}*`);

        const pools = new Map<string, { available: number; processing: number }>();

        for (const key of allKeys) {
            const keyWithoutPrefix = key.replace(KEY_PREFIX, '');

            if (keyWithoutPrefix.includes(':processing:')) {
                const poolName = keyWithoutPrefix.split(':processing:')[0];
                if (!pools.has(poolName)) {
                    pools.set(poolName, { available: 0, processing: 0 });
                }
                const count = await redis.llen(key);
                pools.get(poolName)!.processing += count;
            } else {
                const poolName = keyWithoutPrefix;
                if (!pools.has(poolName)) {
                    pools.set(poolName, { available: 0, processing: 0 });
                }
                const count = await redis.llen(key);
                pools.get(poolName)!.available = count;
            }
        }

        if (pools.size === 0) {
            console.log('No pools found. Run `npm run pool:seed` to create pools.');
            return;
        }

        console.log('Pool Status:');
        console.log('─'.repeat(60));

        for (const [poolName, stats] of Array.from(pools.entries()).sort()) {
            const total = stats.available + stats.processing;
            const utilizationPct = total > 0 ? ((stats.processing / total) * 100).toFixed(1) : '0.0';

            console.log(`\n  ${poolName}`);
            console.log(`    Available:  ${stats.available}`);
            console.log(`    Processing: ${stats.processing}`);
            console.log(`    Total:      ${total}`);
            console.log(`    Utilization: ${utilizationPct}%`);
        }

        console.log('\n' + '─'.repeat(60));

    } catch (error) {
        if ((error as any).code === 'ECONNREFUSED') {
            console.error('✗ Cannot connect to Redis. Is it running?');
            console.error('  Start with: npm run redis:start');
        } else {
            console.error('Error:', error);
        }
    } finally {
        await redis.quit();
    }
}

showPoolStatus();
