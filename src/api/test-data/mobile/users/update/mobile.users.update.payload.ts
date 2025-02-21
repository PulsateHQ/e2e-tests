import { UpdateMobileUserPayload } from '@_src/api/models/mobile.users.model';
import { faker } from '@faker-js/faker/locale/en';

export const updateMobileUserPayload: UpdateMobileUserPayload = {
  alias: '',
  current_location: [51.1524919, 17.0454794],
  custom_tags: [],
  occurred_at: 1663059515,
  screen_records: [],
  user: {
    age: '31',
    device: {
      email: faker.internet.email(),
      phone: faker.phone.number(),
      type: 'android',
      token: faker.string.uuid(),
      os_version: '14',
      sdk_version: '4.7.0',
      app_version: '4.7.0.9',
      language: 'en',
      timezone: 'GMT+01:00',
      push_permission: true,
      location_permission: true,
      background_location_permission: true
    },
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    gender: faker.person.sex(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number()
  },
  user_actions: []
};
