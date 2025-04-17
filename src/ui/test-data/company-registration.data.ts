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

  return {
    fullName: faker.internet.userName(),
    username: faker.internet.userName(),
    invalidEmail: 'wrong_email.com',
    validEmail: faker.internet.email(),
    shortPassword: faker.internet.password({ length: 7 }),
    validPassword,
    // Intentionally different from validPassword to test mismatch errors
    passwordConfirmation: 'Password',
    companyName: faker.company.name(),
    appName: faker.company.name(),
    activationCode: '012345678012345678012345678012345678'
  };
}
