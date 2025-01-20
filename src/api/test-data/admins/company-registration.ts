import { CompanyRegistrationRequest } from '../../models/admin.model';
import { faker } from '@faker-js/faker/locale/en';

export const generateCompanyPayload = (
  activationCode: string
): CompanyRegistrationRequest => {
  const password = `${faker.internet.password({ length: 10 })}Aa1!`;

  return {
    name: faker.person.fullName(),
    email: faker.internet.email({ provider: 'pulsatehq.com' }),
    username: faker.internet.username().toLowerCase(),
    password: password,
    password_confirmation: password,
    activation_code: activationCode,
    company_name: faker.company.name(),
    app_name: faker.company.catchPhrase(),
    role: 'master_admin',
    generate_admin_token: true
  };
};
