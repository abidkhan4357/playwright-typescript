export interface TestUser {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface PoolStats {
    available: number;
    processing: number;
}

export interface TestDataProvider {
    acquire<T>(poolName: string): Promise<T | null>;
    release<T>(poolName: string, data: T): Promise<void>;
    getStats(poolName: string): Promise<PoolStats>;
    isAvailable(): Promise<boolean>;
    close(): Promise<void>;
}

export enum PoolName {
    USERS_FRESH = 'users:fresh',
    USERS_REGISTERED = 'users:registered'
}
