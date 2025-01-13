import { API_E2E_APP_ID, BASE_URL, SDK_API_URL } from '@_config/env.config';

export const apiUrls = {
  importUsersUrl: `${BASE_URL}/api/v2/import_users_for_single_app`,
  segmentsUrlV1: `${BASE_URL}/api/v1/apps/${API_E2E_APP_ID}/segments`,
  segmentsUrlV2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/segments`,
  superAdminsFeatureFlagUrlV2: `${BASE_URL}/api/v2/super_admins/feature_flags`,
  campaignsUrlV2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/campaigns`,
  usersUrlV1: `${BASE_URL}/api/v1/apps/${API_E2E_APP_ID}/users`,
  usersUrlV2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/users`,
  combinedStatsUrlV2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/campaigns/combined_stats`,
  startSessionUrlV4: `${SDK_API_URL}/api/mobile/v4/sessions/start`,
  updateUserUrlV4: `${SDK_API_URL}/api/mobile/v4/users/update`,
  getInboxMessageUrlV2: `${SDK_API_URL}/api/mobile/v2/messages/get_inbox`,
  getMessagesUrlV2: `${SDK_API_URL}/api/mobile/v2/messages/messages`
};
