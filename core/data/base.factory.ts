/**
 * Template map interface for mapping template keys to generator functions
 */
export interface TemplateMap<T> {
    [key: string]: () => Partial<T>;
}

/**
 * Base abstract class for data factories
 * Provides a foundation for creating test data with different templates
 */
export abstract class BaseFactory<T> {
    protected abstract templates: TemplateMap<T>;

    /**
     * Add a new template to the template map
     * @param templateName - Name of the template
     * @param template - Template generator function
     */
    protected addTemplate(templateName: string, template: () => Partial<T>): void {
        this.templates[templateName] = template;
    }

    /**
     * Generate test data from a specified template
     * @param templateName - Name of the template to use
     * @returns Generated test data
     */
    public generate(templateName: string): Partial<T> {
        const template = this.templates[templateName];
        
        if (!template) {
            throw new Error(`Template "${templateName}" not found`);
        }
        
        return template();
    }

    /**
     * Generate multiple test data objects from a specified template
     * @param templateName - Name of the template to use
     * @param count - Number of objects to generate
     * @returns Array of generated test data
     */
    public generateMany(templateName: string, count: number): Partial<T>[] {
        return Array.from({ length: count }, () => this.generate(templateName));
    }

    /**
     * Generate test data with custom overrides
     * @param templateName - Name of the template to use
     * @param overrides - Custom fields to override in the template
     * @returns Generated test data with overrides
     */
    public generateWithOverrides(templateName: string, overrides: Partial<T>): Partial<T> {
        const baseData = this.generate(templateName);
        return { ...baseData, ...overrides };
    }
}
