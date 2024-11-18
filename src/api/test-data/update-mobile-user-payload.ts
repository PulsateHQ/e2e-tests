import { UpdateMobileUserPayload } from '@_src/api/models/update-mobile-user.api.model';
import { faker } from '@faker-js/faker/locale/en';

export const updateMobileUserPayload: UpdateMobileUserPayload = {
  alias: 'michal1@pulsatehq.com',
  current_location: [49.4302321, 19.9674985],
  custom_tags: [],
  occurred_at: 1663059515,
  screen_records: [],
  user: {
    age: '31',
    device: {
      email: faker.internet.email(),
      phone: faker.phone.number(),
      type: 'android',
      language: 'en',
      token: '{{TOKEN}}',
      os_version: '13',
      sdk_version: '3.8.1',
      app_version: '3.8.1-beta',
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
  user_actions: [
    {
      guid: '',
      key: 'in_app_delivery',
      occurred_at_array: ['1730990106'],
      type: 'campaign'
    },
    {
      guid: '',
      key: 'in_app_impression',
      occurred_at_array: ['1730990106'],
      type: 'campaign'
    },
    {
      guid: '',
      key: 'in_app_dismiss',
      occurred_at_array: ['1730990106'],
      type: 'campaign'
    }
  ]
};
