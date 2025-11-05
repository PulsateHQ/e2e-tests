import {
  API_E2E_APP_ID,
  BASE_URL,
  SDK_API_URL,
  WEB_SDK_API_URL
} from '@_config/env.config';

export const apiUrls = {
  // Health check endpoint
  health: {
    v1: {
      check: `${BASE_URL}/api/v1/health_check`
    }
  },

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
      currentAdmin: `${BASE_URL}/admins/current_admin`,
      logout: `${BASE_URL}/admins/api/v2/logout`
    },
    mobile: {
      base: `${BASE_URL}/mobile/apps`
    }
  },

  // SuperAdmin related endpoints
  superAdmins: {
    v2: {
      base: `${BASE_URL}/api/v2/super_admins`
    }
  },

  // Deeplinks related endpoints
  deeplinks: {
    v2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/deeplinks`
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

  // Geofence related endpoints
  geofences: {
    v2: `${BASE_URL}/api/v2/apps/${API_E2E_APP_ID}/geofences`
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
    },
    geofences: {
      v2: {
        sendGeofenceEvent: `${SDK_API_URL}/api/mobile/v2/general/send_geofence_event`
      }
    }
  },

  // Web SDK related endpoints
  webSdk: {
    v1: {
      start: `${WEB_SDK_API_URL}/api/v1/session/start`,
      statistics: `${WEB_SDK_API_URL}/api/v1/statistics`
    }
  }
};

/**
 * Generates API URLs with a dynamic appId.
 * Use this for parallel test execution where each test has its own isolated app.
 *
 * @param appId - The app ID to use in the URLs
 * @returns API URLs object with the specified appId
 */
export function getApiUrlsForApp(appId: string) {
  return {
    ...apiUrls,
    deeplinks: {
      v2: `${BASE_URL}/api/v2/apps/${appId}/deeplinks`
    },
    users: {
      v1: `${BASE_URL}/api/v1/apps/${appId}/users`,
      v2: `${BASE_URL}/api/v2/apps/${appId}/users`,
      import: `${BASE_URL}/api/v2/import_users_for_single_app`
    },
    segments: {
      v1: `${BASE_URL}/api/v1/apps/${appId}/segments`,
      v2: `${BASE_URL}/api/v2/apps/${appId}/segments`
    },
    groups: {
      v2: `${BASE_URL}/api/v2/apps/${appId}/groups`
    },
    geofences: {
      v2: `${BASE_URL}/api/v2/apps/${appId}/geofences`
    },
    campaigns: {
      v2: {
        base: `${BASE_URL}/api/v2/apps/${appId}/campaigns`,
        combinedStats: `${BASE_URL}/api/v2/apps/${appId}/campaigns`
      }
    }
  };
}
