import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import { getSdkCredentials } from '@_src/api/factories/app.api.factory';
import {
  createCampaignWithApi,
  getCampaignDetailsWithApi
} from '@_src/api/factories/campaigns.api.factory';
import { createGeofenceWithApi } from '@_src/api/factories/geofence.factory';
import { sendGeofenceEventWithApi } from '@_src/api/factories/mobile.geofence.api.factory';
import { startMobileSessionsForGeofenceWithApi } from '@_src/api/factories/mobile.sessions.api.factory';
import { updateMobileUserWithApi } from '@_src/api/factories/mobile.users.api.factory';
import { getInAppCampaignStatsWithApi } from '@_src/api/factories/stats.api.factory';
import {
  getAllUsersWithApi,
  getUserGeofenceEventsWithApi
} from '@_src/api/factories/users.api.factory';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/api/models/admin.model';
import { InAppEvents } from '@_src/api/models/mobile.users.model';
import {
  createCampaignInAppLargeButtonWithUrl,
  createCampaignInAppSmallTopWithUrl
} from '@_src/api/test-data/cms/campaign/create-inapp-campaign.payload';
import { geofencePayload } from '@_src/api/test-data/cms/geofence/geofence.payload';
import { startMobileSessionInAppPayload } from '@_src/api/test-data/mobile/sessions/start-session.payload';
import {
  updateMobileInAppUserPayload,
  userActions
} from '@_src/api/test-data/mobile/update/update-user.payload';
import {
  deleteAllCampaigns,
  deleteAllGeofences,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Geofence InApp Campaign', () => {
  let APIE2ETokenSDKModel: APIE2ETokenSDKModel;

  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  test.beforeAll(async ({ request }) => {
    const sdkCredentialsResponse = await getSdkCredentials(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    const sdkCredentials = await sdkCredentialsResponse.json();

    APIE2ETokenSDKModel = {
      apiE2EAccessTokenSdk: sdkCredentials.access_token
    };
  });

  test.beforeEach(async ({ request }) => {
    await deleteAllCampaigns(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    await deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin);
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    await deleteAllGeofences(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
  });
  test('should create a enter geofence In-App Large campaign with a URL button and click it', async ({
    request
  }) => {
    const numberOfUsers = 1;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    // Create Geofence
    const createGeofenceResponse = await createGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      geofencePayload()
    );
    const createGeofenceResponseJson = await createGeofenceResponse.json();

    // Prepare Campaign Payload

    const createCampaignInAppLargeButtonWithUrlPayload =
      createCampaignInAppLargeButtonWithUrl(
        [],
        [createGeofenceResponseJson.id],
        {
          [createGeofenceResponseJson.id]: 'enter'
        }
      );

    // Create Campaign

    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignInAppLargeButtonWithUrlPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignInAppLargeButtonWithUrlPayload.name
    );

    const getCampaignDetailsResponse = await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      'Active'
    );

    expect(getCampaignDetailsResponse.status).toBe('Active');

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    expect(getUsersResponseJson.data.length).toBe(numberOfUsers);

    // First user - will perform actions
    const firstUser = getUsersResponseJson.data[0];

    // Start session for first user
    const firstUserSessionPayload = {
      ...startMobileSessionInAppPayload(),
      alias: firstUser.alias,
      current_location: createGeofenceResponseJson.location
    };
    const startMobileSessionForGeofenceWithApiResponse =
      await startMobileSessionsForGeofenceWithApi(
        request,
        APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
        firstUserSessionPayload,
        createGeofenceResponseJson.name
      );

    const startMobileSessionForGeofenceWithApiResponseJson =
      await startMobileSessionForGeofenceWithApiResponse.json();

    // Send geofence enter event
    const geofenceEventPayload = {
      alias: firstUser.alias,
      guid: firstUserSessionPayload.guid,
      geofence_guid:
        startMobileSessionForGeofenceWithApiResponseJson.geofences[0].guid,
      event: startMobileSessionForGeofenceWithApiResponseJson.geofences[0].type,
      current_location: createGeofenceResponseJson.location,
      horizontal_accuracy: 1
    };

    await sendGeofenceEventWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      geofenceEventPayload
    );

    const getUserGeofenceEventsWithApiResponse =
      await getUserGeofenceEventsWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        firstUser.id
      );

    const getUserGeofenceEventsWithApiResponseJson =
      await getUserGeofenceEventsWithApiResponse.json();

    expect(getUserGeofenceEventsWithApiResponseJson.data.length).toBe(1);

    // First user performs actions
    const firstUserUpdatePayload = {
      ...updateMobileInAppUserPayload(),
      alias: firstUser.alias,
      user_actions: [
        {
          ...userActions[InAppEvents.IN_APP_DELIVERY],
          guid: createCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_IMPRESSION],
          guid: createCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_BUTTON_CLICK_ONE],
          guid: createCampaignResponseJson.guid
        }
      ]
    };

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserUpdatePayload
    );

    const getCampaignStatsWithWaitResponse = await getInAppCampaignStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      1
    );

    const getCampaignStatsWithWaitResponseJson =
      await getCampaignStatsWithWaitResponse.json();

    // Assert Validate Response Body
    expect(getCampaignStatsWithWaitResponseJson).toHaveProperty('in_app');
    expect(getCampaignStatsWithWaitResponseJson.in_app.send).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.in_app.delivery).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.in_app.bounce).toHaveProperty(
      'total_uniq',
      0
    );
    expect(getCampaignStatsWithWaitResponseJson.in_app.error).toHaveProperty(
      'total_uniq',
      0
    );
    expect(getCampaignStatsWithWaitResponseJson.in_app.dismiss).toHaveProperty(
      'total_uniq',
      0
    );
    expect(
      getCampaignStatsWithWaitResponseJson.in_app.button_click_one
    ).toHaveProperty('total_uniq', 1);
    expect(getCampaignStatsWithWaitResponseJson.in_app.clicks).toHaveProperty(
      'total_uniq',
      1
    );
    expect(
      getCampaignStatsWithWaitResponseJson.in_app.impression
    ).toHaveProperty('total_uniq', 1);
  });

  test('should create a exit geofence In-App Small Top campaign with 2 users but only 1 user clicks the button', async ({
    request
  }) => {
    const numberOfUsers = 2;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    // Create Geofence
    const createGeofenceResponse = await createGeofenceWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      geofencePayload()
    );
    const createGeofenceResponseJson = await createGeofenceResponse.json();

    // Get users alias
    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    expect(getUsersResponseJson.data.length).toBe(numberOfUsers);

    // First user - will perform actions
    const firstUser = getUsersResponseJson.data[0];
    // Second user - will not perform any actions
    const secondUser = getUsersResponseJson.data[1];

    // Create Campaign
    const createCampaignInAppSmallTopWithUrlPayload =
      createCampaignInAppSmallTopWithUrl([], [createGeofenceResponseJson.id], {
        [createGeofenceResponseJson.id]: 'exit'
      });

    // Create campaign
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignInAppSmallTopWithUrlPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignInAppSmallTopWithUrlPayload.name
    );

    const getCampaignDetailsResponse = await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      'Active'
    );

    expect(getCampaignDetailsResponse.status).toBe('Active');

    // Start session for first user
    const firstUserSessionPayload = {
      ...startMobileSessionInAppPayload(),
      alias: firstUser.alias,
      current_location: createGeofenceResponseJson.location
    };

    const startMobileSessionForGeofenceWithApiResponse =
      await startMobileSessionsForGeofenceWithApi(
        request,
        APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
        firstUserSessionPayload,
        createGeofenceResponseJson.name
      );
    const startMobileSessionForGeofenceWithApiResponseJson =
      await startMobileSessionForGeofenceWithApiResponse.json();

    // Send geofence enter event for first user
    const geofenceEventPayloadFirstUser = {
      alias: firstUser.alias,
      guid: firstUserSessionPayload.guid,
      geofence_guid:
        startMobileSessionForGeofenceWithApiResponseJson.geofences[0].guid,
      event: 'exit' as const,
      current_location: createGeofenceResponseJson.location,
      horizontal_accuracy: 1
    };

    await sendGeofenceEventWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      geofenceEventPayloadFirstUser
    );

    // First user performs actions
    const firstUserUpdatePayload = {
      ...updateMobileInAppUserPayload(),
      alias: firstUser.alias,
      user_actions: [
        {
          ...userActions[InAppEvents.IN_APP_DELIVERY],
          guid: createCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_IMPRESSION],
          guid: createCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_BUTTON_CLICK_ONE],
          guid: createCampaignResponseJson.guid
        }
      ]
    };

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserUpdatePayload
    );

    // adjust second user action on in_app permission
    // Start session for second user
    const secondUserSessionPayload = {
      ...startMobileSessionInAppPayload(),
      alias: secondUser.alias,
      current_location: createGeofenceResponseJson.location,
      device: {
        ...startMobileSessionInAppPayload().device,
        in_app_permission: false
      }
    };

    await startMobileSessionsForGeofenceWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      secondUserSessionPayload,
      createGeofenceResponseJson.name
    );

    // Send geofence enter event for first user
    const geofenceEventPayloadSecondUser = {
      alias: secondUser.alias,
      guid: secondUserSessionPayload.guid,
      geofence_guid:
        startMobileSessionForGeofenceWithApiResponseJson.geofences[0].guid,
      event: 'exit' as const,
      current_location: createGeofenceResponseJson.location,
      horizontal_accuracy: 1
    };

    await sendGeofenceEventWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      geofenceEventPayloadSecondUser
    );

    // Second user doesn't perform any actions
    const secondUserUpdatePayload = {
      ...updateMobileInAppUserPayload(),
      alias: secondUser.alias,
      user: {
        ...updateMobileInAppUserPayload().user,
        device: {
          ...updateMobileInAppUserPayload().user.device,
          in_app_permission: false
        }
      },
      user_actions: [
        {
          ...userActions[InAppEvents.IN_APP_DELIVERY],
          guid: createCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_BOUNCE],
          guid: createCampaignResponseJson.guid
        }
      ]
    };

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      secondUserUpdatePayload
    );

    const getCampaignStatsWithWaitResponse = await getInAppCampaignStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      2
    );

    const getCampaignStatsWithWaitResponseJson =
      await getCampaignStatsWithWaitResponse.json();

    // Assert Validate Response Body
    expect(getCampaignStatsWithWaitResponseJson).toHaveProperty('in_app');
    expect(getCampaignStatsWithWaitResponseJson.in_app.send).toHaveProperty(
      'total_uniq',
      2
    );
    expect(getCampaignStatsWithWaitResponseJson.in_app.delivery).toHaveProperty(
      'total_uniq',
      2
    );
    expect(getCampaignStatsWithWaitResponseJson.in_app.bounce).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.in_app.error).toHaveProperty(
      'total_uniq',
      0
    );
    expect(getCampaignStatsWithWaitResponseJson.in_app.dismiss).toHaveProperty(
      'total_uniq',
      0
    );
    expect(
      getCampaignStatsWithWaitResponseJson.in_app.button_click_one
    ).toHaveProperty('total_uniq', 1);
    expect(getCampaignStatsWithWaitResponseJson.in_app.clicks).toHaveProperty(
      'total_uniq',
      1
    );
    expect(
      getCampaignStatsWithWaitResponseJson.in_app.impression
    ).toHaveProperty('total_uniq', 1);
  });
});
