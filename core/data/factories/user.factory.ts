import { faker } from '@faker-js/faker';
import { BaseFactory, TemplateMap } from '../base.factory';
import { UserAccount } from '../../models/user.model';
import { ConfigManager } from '../../config/config.manager';

export class UserFactory extends BaseFactory<UserAccount> {
    private config = ConfigManager.getInstance();
    
    protected templates: TemplateMap<UserAccount> = {
        validUser: () => ({
            email: this.config.defaultUser.email,
            password: this.config.defaultUser.password,
            firstName: 'Bill',
            lastName: 'Smith',
            phone: '5165551200'
        }),
        
        invalidEmailAndPassword: () => ({
            email: 'Testfakeemail@gmail.com',
            password: 'Testfakepassword'
        }),

        invalidEmail: () => ({
            email: 'Testfakeemail@gmail.com',
            password: this.config.defaultUser.password
        }),

        invalidPassword: () => ({
            email: this.config.defaultUser.email,
            password: 'Testfakepassword'
        }),

        emptyCredentials: () => ({
            email: '',
            password: ''
        }),
        
        randomUser: () => ({
            email: faker.internet.email(),
            password: faker.internet.password({ length: 10, memorable: true }),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            phone: faker.phone.number(),
            address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zipCode: faker.location.zipCode(),
                country: faker.location.country()
            }
        })
    };
    
    public createCustomUser(email: string, password: string): Partial<UserAccount> {
        return this.generateWithOverrides('randomUser', { 
            email, 
            password 
        });
    }
}
