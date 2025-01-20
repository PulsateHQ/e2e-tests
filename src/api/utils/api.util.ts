import { API_E2E_APP_ID, BASE_URL, SDK_API_URL } from '@_config/env.config';

export const apiUrls = {
  // Admin related endpoints
  admins: {
    v2: {
      base: `${BASE_URL}/api/v2/admins`,
      register: `${BASE_URL}/api/v2/admins/register`
    }
  },

  // SuperAdmin related endpoints
  superAdmins: {
    v2: {
      base: `${BASE_URL}/api/v2/super_admins`
    }
  },

  // User related endpoints
  users: {
    v1: `${BASE_URL}/api/v1/apps/${API_E2E_APP_ID}/users`,
    v2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/users`,
    import: `${BASE_URL}/api/v2/import_users_for_single_app`
  },

  // Segment related endpoints
  segments: {
    v1: `${BASE_URL}/api/v1/apps/${API_E2E_APP_ID}/segments`,
    v2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/segments`
  },

  // Group related endpoints
  groups: {
    v2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/groups`
  },

  // Campaign related endpoints
  campaigns: {
    v2: {
      base: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/campaigns`,
      combinedStats: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/campaigns`
    }
  },

  // SDK related endpoints
  sdk: {
    sessions: {
      v4: {
        start: `${SDK_API_URL}/api/mobile/v4/sessions/start`
      }
    },
    users: {
      v4: {
        update: `${SDK_API_URL}/api/mobile/v4/users/update`
      }
    },
    messages: {
      v2: {
        inbox: `${SDK_API_URL}/api/mobile/v2/messages/get_inbox`,
        messages: `${SDK_API_URL}/api/mobile/v2/messages/messages`
      }
    }
  }
};
