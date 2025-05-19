import { CompanyRegistrationModel } from '@_src/ui/models/user.model';
import { faker } from '@faker-js/faker/locale/en';

/**
 * Generates test data for company registration tests
 * @returns CompanyRegistrationModel with randomized test data
 */
export function generateCompanyRegistrationData(): CompanyRegistrationModel {
  const validPassword = faker.internet.password({
    length: 8,
    memorable: false,
    pattern: /[A-Za-z0-9!@#$%^&*()_+]/,
    prefix: 'A1!'
  });

  // Generate single-word names using specific Faker methods
  const fullName = faker.person.firstName(); // Just a first name
  const username = faker.internet.userName().split('.')[0]; // First part of username
  const companyName = faker.company.buzzPhrase().split(' ')[0]; // First word of a company phrase
  const appName = faker.commerce.productName().split(' ')[0]; // First word of a product name

  return {
    fullName,
    username,
    invalidEmail: 'wrong_email.com',
    validEmail: faker.internet.email(),
    shortPassword: faker.internet.password({ length: 7 }),
    validPassword,
    // Intentionally different from validPassword to test mismatch errors
    passwordConfirmation: 'Password',
    companyName,
    appName,
    activationCode: '012345678012345678012345678012345678'
  };
}
