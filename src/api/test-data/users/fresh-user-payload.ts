import { userRequestPayload } from './create-users';
import { UserRequest } from '@_src/api/models/user.api.model';
import { faker } from '@faker-js/faker/locale/en';

export const createFreshUserPayload = (): UserRequest => {
  return {
    age: faker.number.int({ min: 18, max: 100 }),
    alias: faker.internet.userName({ firstName: 'Piotr' }).replace(/\./g, '_'),
    current_city: faker.location.city(),
    current_country: faker.location.country(),
    current_location: [faker.location.longitude(), faker.location.latitude()],
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    gender: 'man',
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
    device: {
      ...userRequestPayload.device,
      guid: faker.string.uuid()
    },
    custom_tags: userRequestPayload.custom_tags
  };
};
