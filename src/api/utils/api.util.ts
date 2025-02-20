import { API_E2E_APP_ID, BASE_URL, SDK_API_URL } from '@_config/env.config';

export const apiUrls = {
  // App related endpoints
  apps: {
    v2: {
      base: `${BASE_URL}/api/v2/apps`
    }
  },

  // Admin related endpoints
  admins: {
    v2: {
      register: `${BASE_URL}/admins/api/v2/register`,
      whoami: `${BASE_URL}/sessions/api/v2/whoami`,
      currentAdmin: `${BASE_URL}/admins/current_admin`
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
        getInbox: `${SDK_API_URL}/api/mobile/v2/messages/get_inbox`,
        getMessages: `${SDK_API_URL}/api/mobile/v2/messages/get_messages`,
        getInboxItem: `${SDK_API_URL}/api/mobile/v2/messages/get_inbox_item`
      }
    },
    notifications: {
      v4: {
        card: `${SDK_API_URL}/api/mobile/v4/notifications/card`
      }
    }
  }
};
