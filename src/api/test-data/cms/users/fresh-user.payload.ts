import { createUserRequestPayload } from './create-users.payload';
import { UserRequest } from '@_src/api/models/user.model';
import { faker } from '@faker-js/faker/locale/en';

export const createFreshUserPayload = (): UserRequest => {
  return {
    age: faker.number.int({ min: 18, max: 100 }),
    alias: `${faker.internet.username({ firstName: 'playwright' }).replace(/\./g, '_')},`,
    current_city: faker.location.city(),
    current_country: faker.location.country(),
    current_location: [faker.location.longitude(), faker.location.latitude()],
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    gender: 'man',
    lastName: faker.person.lastName(),
    phone: faker.phone.number(),
    device: {
      ...createUserRequestPayload().device,
      guid: faker.string.uuid()
    },
    custom_tags: createUserRequestPayload().custom_tags
  };
};
