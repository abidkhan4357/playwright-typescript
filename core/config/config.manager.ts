import * as fs from 'fs';
import * as path from 'path';

/**
 * ConfigManager handles configuration management for the test framework
 * Provides access to environment variables, test data, and settings
 */
export class ConfigManager {
    private static instance: ConfigManager;
    private config: Record<string, any>;

    private constructor() {
        this.config = this.loadConfig();
    }

    /**
     * Get ConfigManager instance (Singleton pattern)
     */
    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    private loadConfig(): Record<string, any> {
        try {
            const configPath = path.join(__dirname, '../../config/environment.json');
            console.log('Loading config from:', configPath);
            
            const env = process.env.NODE_ENV || 'qa';
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log(`Using environment: ${env}`);
            
            return configData[env] || configData['qa'];
        } catch (error) {
            console.error('Error loading config file:', error);
            return {};
        }
    }

    get baseUrl(): string {
        return this.config.baseUrl;
    }

    get apiBaseUrl(): string {
        return this.config.apiBaseUrl;
    }

    get defaultUser(): { email: string; password: string } {
        return {
            email: this.config.defaultUser?.email,
            password: this.config.defaultUser?.password,
        };
    }

    get timeout(): number {
        return this.config.timeout || 30000;
    }

    /**
     * Get value from configuration by key
     * @param key - Configuration key
     * @param defaultValue - Default value if key is not found
     */
    get<T>(key: string, defaultValue?: T): T {
        const keys = key.split('.');
        let value: any = this.config;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue as T;
            }
        }

        return (value as T) || defaultValue as T;
    }
}
