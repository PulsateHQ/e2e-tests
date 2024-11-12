import { API_E2E_APP_ID, BASE_URL, SDK_API_URL } from '@_config/env.config';

export const apiUrls = {
  importUsersUrl: `${BASE_URL}/api/v2/import_users_for_single_app`,
  segmentsUrlV1: `${BASE_URL}/api/v1/apps/${API_E2E_APP_ID}/segments`,
  campaignsUrlV2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/campaigns`,
  usersUrlV2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/users`,
  startSessionUrlV4: `${SDK_API_URL}/api/mobile/v4/sessions/start`,
  updateUserUrlV4: `${SDK_API_URL}/api/mobile/v4/users/update`,
  combinedStatsUrlV2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/campaigns/combined_stats`
};
