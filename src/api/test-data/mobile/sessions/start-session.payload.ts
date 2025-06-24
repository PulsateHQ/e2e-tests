import { StartMobileSessionPayload } from '@_src/api/models/mobile.sessions.model';
import { faker } from '@faker-js/faker/locale/en';

export const startMobileSessionInAppPayload =
  (): StartMobileSessionPayload => ({
    alias: '',
    device: {
      type: 'ios',
      token: faker.string.uuid(),
      bluetooth_state: 'on',
      os_version: '16',
      sdk_version: '4.7.0',
      app_version: '4.7.0.9',
      language: 'en',
      location_permission: true,
      push_permission: true,
      background_location_permission: true,
      in_app_permission: true,
      timezone: 'GMT+00:00'
    },
    guid: faker.string.uuid(),
    occurred_at: 1740041394,
    localization_data: 'true'
  });

export const startMobileSessionFeedPayload = (): StartMobileSessionPayload => ({
  alias: '',
  current_location: [51.1524919, 17.0454794],
  device: {
    type: 'android',
    token: faker.string.uuid(),
    bluetooth_state: 'on',
    os_version: '14',
    sdk_version: '4.7.0',
    app_version: '4.7.0.9',
    language: 'en',
    location_permission: true,
    push_permission: true,
    background_location_permission: true,
    in_app_permission: true,
    timezone: 'GMT+01:00'
  },
  guid: faker.string.uuid(),
  occurred_at: 1740041394,
  localization_data: 'true'
});
