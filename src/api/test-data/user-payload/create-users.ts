import { UserRequest } from '@_src/api/models/user.api.model';
import { faker } from '@faker-js/faker/locale/en';

// Template payload with static values
export const userRequestPayload: UserRequest = {
  age: faker.number.int({ min: 18, max: 100 }),
  alias: faker.internet.username({ firstName: 'Piotr' }),
  current_city: faker.location.city(),
  current_country: faker.location.country(),
  current_location: [faker.location.longitude(), faker.location.latitude()],
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  gender: 'man',
  lastName: faker.person.lastName(),
  phone: faker.phone.number(),
  device: {
    active: false,
    uninstalled: false,
    guid: faker.string.uuid(),
    type: 'android',
    app_version: '3.5.0RC5-beta',
    os_version: '10',
    sdk_version: '3.5.0RC5',
    timezone: 'WET',
    language: 'en',
    location_permission: 'true',
    push_permission: 'true'
  },
  custom_tags: [
    {
      key: 'bool_1',
      value: true,
      type: 'Boolean',
      action: 'update'
    },
    {
      key: 'bool_2',
      value: 'true',
      type: 'Boolean',
      action: 'update'
    },
    {
      key: 'bool_3',
      value: false,
      type: 'Boolean',
      action: 'update'
    },
    {
      key: 'bool_4',
      value: 'false',
      type: 'Boolean',
      action: 'update'
    }
  ]
};