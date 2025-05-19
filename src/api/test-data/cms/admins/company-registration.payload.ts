import { CompanyAdminRegistrationRequest } from '../../../models/admin.model';
import { faker } from '@faker-js/faker/locale/en';

export const generateCompanyPayload = (
  activationCode: string
): CompanyAdminRegistrationRequest => {
  const password = `${faker.internet.password({ length: 10 })}Aa1!`;

  return {
    name: faker.person.fullName(),
    email: faker.internet.email({ provider: 'pulsatehq.com' }).toLowerCase(),
    username: faker.internet.username().toLowerCase(),
    password: password,
    password_confirmation: password,
    activation_code: activationCode,
    company_name: faker.company.name(),
    app_name: faker.company.name(),
    role: 'master_admin',
    generate_admin_token: true
  };
};

export const generateAdminPayload = (
  inviteToken: string,
  generateAdminToken: boolean
): CompanyAdminRegistrationRequest => {
  const password = `${faker.internet.password({ length: 10 })}Aa1!`;

  return {
    name: faker.person.fullName(),
    username: faker.internet.username().toLowerCase(),
    password: password,
    password_confirmation: password,
    invite_token: inviteToken,
    generate_admin_token: generateAdminToken
  };
};
