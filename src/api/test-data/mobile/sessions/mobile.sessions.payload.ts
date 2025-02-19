import { StartMobileSessionPayload } from '@_src/api/models/mobile.sessions.model';
import { faker } from '@faker-js/faker/locale/en';

export const startMobileSessionPayload: StartMobileSessionPayload = {
  alias: '',
  device: {
    type: 'android',
    token: faker.string.uuid(),
    bluetooth_state: 'on',
    os_version: 'ios',
    sdk_version: '2.13.8',
    app_version: '2.13.8-prod',
    language: 'en',
    location_permission: 'true',
    push_permission: 'true'
  }
};
