import {
  InAppEvents,
  UpdateMobileUserPayload,
  UserAction
} from '@_src/api/models/mobile.users.model';
import { faker } from '@faker-js/faker/locale/en';

const currentTimestamp = Math.floor(Date.now() / 1000).toString();

export const updateMobileFeedUserPayload = (): UpdateMobileUserPayload => ({
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
      background_location_permission: true,
      in_app_permission: true
    },
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    gender: faker.person.sex(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number()
  },
  user_actions: []
});

export const updateMobileInAppUserPayload = (): Omit<
  UpdateMobileUserPayload,
  'user_actions'
> => ({
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
      background_location_permission: true,
      in_app_permission: true
    },
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    gender: faker.person.sex(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number()
  }
});

// Action templates
export const userActions: Record<InAppEvents, UserAction> = {
  [InAppEvents.IN_APP_DELIVERY]: {
    guid: '',
    key: InAppEvents.IN_APP_DELIVERY,
    occurred_at_array: [currentTimestamp],
    type: 'campaign'
  },
  [InAppEvents.IN_APP_IMPRESSION]: {
    guid: '',
    key: InAppEvents.IN_APP_IMPRESSION,
    occurred_at_array: [currentTimestamp],
    type: 'campaign'
  },
  [InAppEvents.IN_APP_DISMISS]: {
    guid: '',
    key: InAppEvents.IN_APP_DISMISS,
    occurred_at_array: [currentTimestamp],
    type: 'campaign'
  },
  [InAppEvents.IN_APP_BOUNCE]: {
    guid: '',
    key: InAppEvents.IN_APP_BOUNCE,
    occurred_at_array: [currentTimestamp],
    type: 'campaign'
  },
  [InAppEvents.IN_APP_BUTTON_CLICK_ONE]: {
    guid: '',
    key: InAppEvents.IN_APP_BUTTON_CLICK_ONE,
    occurred_at_array: [currentTimestamp],
    type: 'campaign'
  },
  [InAppEvents.IN_APP_BUTTON_CLICK_TWO]: {
    guid: '',
    key: InAppEvents.IN_APP_BUTTON_CLICK_TWO,
    occurred_at_array: [currentTimestamp],
    type: 'campaign'
  }
};

// Default payload with all actions (for backward compatibility)
export const updateMobileUserPayload = (): UpdateMobileUserPayload => ({
  ...updateMobileInAppUserPayload(),
  user_actions: [
    userActions[InAppEvents.IN_APP_DELIVERY],
    userActions[InAppEvents.IN_APP_IMPRESSION],
    userActions[InAppEvents.IN_APP_BUTTON_CLICK_ONE]
  ]
});
