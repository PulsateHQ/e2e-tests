import { CompanyRegistrationRequest } from '../../models/admin.model';
import { faker } from '@faker-js/faker';

export const generateCompanyPayload = (
  companyIdentifier: string = ''
): CompanyRegistrationRequest => {
  const companyName = faker.company.name();
  const password = `${faker.internet.password({ length: 10 })}Aa1!`; // Ensures password meets complexity requirements

  return {
    name: faker.person.fullName(),
    email: faker.internet.email({ provider: 'pulsatehq.com' }),
    username: faker.internet.userName().toLowerCase(),
    password: password,
    password_confirmation: password, // Using same password to ensure they match
    activation_code: '', // Empty string as it will be passed as parameter
    company_name: companyIdentifier
      ? `${companyName} ${companyIdentifier}`
      : companyName,
    app_name: faker.company.catchPhrase(),
    role: 'master_admin',
    generate_admin_token: true
  };
};
