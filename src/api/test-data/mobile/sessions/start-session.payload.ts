import { StartMobileSessionPayload } from '@_src/api/models/mobile.sessions.model';
import { faker } from '@faker-js/faker/locale/en';

export const startMobileSessionInAppPayload: StartMobileSessionPayload = {
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
};

export const startMobileSessionFeedPayload: StartMobileSessionPayload = {
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
};

/**
 * Creates a customized mobile session payload with unique values
 * @param overrides - Object with properties to override in the base payload
 * @param basePayload - The base payload to use (defaults to startMobileSessionInAppPayload)
 * @returns A new session payload with unique values
 */
export const createMobileSessionPayload = (
  overrides: Partial<StartMobileSessionPayload> = {},
  basePayload: StartMobileSessionPayload = startMobileSessionInAppPayload
): StartMobileSessionPayload => {
  return {
    ...JSON.parse(JSON.stringify(basePayload)), // Deep clone to avoid modifying the original
    guid: faker.string.uuid(),
    device: {
      ...basePayload.device,
      token: faker.string.uuid(),
      os_version: overrides.device?.os_version || basePayload.device.os_version
    },
    ...overrides
  };
};
