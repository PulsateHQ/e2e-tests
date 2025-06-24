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
import { createDeeplinkWithApi } from '@_src/api/factories/deeplinks.api.factory';
import { updateDeeplinkWithApi } from '@_src/api/factories/deeplinks.api.factory';
import { startMobileSessionsWithApi } from '@_src/api/factories/mobile.sessions.api.factory';
import { updateMobileUserWithApi } from '@_src/api/factories/mobile.users.api.factory';
import { createSegmentWithApi } from '@_src/api/factories/segments.api.factory';
import { getInAppCampaignStatsWithApi } from '@_src/api/factories/stats.api.factory';
import { getAllUsersWithApi } from '@_src/api/factories/users.api.factory';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/api/models/admin.model';
import { InAppEvents } from '@_src/api/models/mobile.users.model';
import {
  createCampaignInAppSmallBottomWithDeeplink,
  createCampaignInAppSmallTopWithDismiss,
  createCampaignInAppSmallTopWithUrl
} from '@_src/api/test-data/cms/campaign/create-inapp-campaign.payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/cms/segment/create-segment-all-users.payload';
import { startMobileSessionInAppPayload } from '@_src/api/test-data/mobile/sessions/start-session.payload';
import {
  updateMobileInAppUserPayload,
  userActions
} from '@_src/api/test-data/mobile/update/update-user.payload';
import { apiUrls } from '@_src/api/utils/api.util';
import {
  deleteAllCampaigns,
  deleteAllDeeplinks,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Small In-App Campaign', () => {
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
  });
  test('should create an In-App Small Top campaign with a URL banner and click it', async ({
    request
  }) => {
    const numberOfUsers = 1;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    // Create Segment
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Create Campaign
    const createCampaignInAppSmallTopWithUrlPayload =
      createCampaignInAppSmallTopWithUrl([
        createSegmentResponseJson.segment.id
      ]);
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

    await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      'Delivered'
    );

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
      alias: firstUser.alias
    };
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserSessionPayload
    );

    // First user performs actions
    const firstUserUpdatePayload = {
      ...updateMobileInAppUserPayload,
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

  test('should create an In-App Small Bottom campaign with a Deeplink banner and click it', async ({
    request
  }) => {
    const numberOfUsers = 1;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    // Create Segment
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    await deleteAllDeeplinks(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );

    const createDeeplinkResponse = await createDeeplinkWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      {
        nickname: 'Plawright',
        target: `${apiUrls.campaigns.v2.base}`
      }
    );

    const updateDeeplinkResponse = await updateDeeplinkWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createDeeplinkResponse.id,
      {
        nickname: 'Plawright Campaign Deeplink',
        target: `${apiUrls.campaigns.v2.base}`
      }
    );

    // Preparing payload for campaign creation
    const createCampaignInAppSmallBottomWithDeeplinkPayload =
      createCampaignInAppSmallBottomWithDeeplink(
        [createSegmentResponseJson.segment.id],
        updateDeeplinkResponse.id
      );

    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignInAppSmallBottomWithDeeplinkPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignInAppSmallBottomWithDeeplinkPayload.name
    );

    await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      'Delivered'
    );

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
      alias: firstUser.alias
    };
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserSessionPayload
    );

    // First user performs actions
    const firstUserUpdatePayload = {
      ...updateMobileInAppUserPayload,
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

  test('should create an In-App Small Top campaign with a dismiss banner, but not click the banner button, but swipe to dismiss', async ({
    request
  }) => {
    const numberOfUsers = 1;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    // Create Segment
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Create Campaign
    const createCampaignInAppSmallTopWithDismissPayload =
      createCampaignInAppSmallTopWithDismiss([
        createSegmentResponseJson.segment.id
      ]);
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignInAppSmallTopWithDismissPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignInAppSmallTopWithDismissPayload.name
    );

    await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      'Delivered'
    );

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
      alias: firstUser.alias
    };
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserSessionPayload
    );

    // First user performs actions of dissming inApp by swipe to dismiss
    const firstUserUpdatePayload = {
      ...updateMobileInAppUserPayload,
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
          ...userActions[InAppEvents.IN_APP_DISMISS],
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
      1
    );
    expect(
      getCampaignStatsWithWaitResponseJson.in_app.button_click_one
    ).toHaveProperty('total_uniq', 0);
    expect(getCampaignStatsWithWaitResponseJson.in_app.clicks).toHaveProperty(
      'total_uniq',
      0
    );
    expect(
      getCampaignStatsWithWaitResponseJson.in_app.impression
    ).toHaveProperty('total_uniq', 1);
  });

  test('should create an In-App Small Top campaign with 2 users but only 1 user clicks the button', async ({
    request
  }) => {
    const numberOfUsers = 2;

    await importRandomUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId,
      numberOfUsers
    );

    // Create Segment
    const createSegmentResponse = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload()
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

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

    // adjust second user action on in_app permission
    // Start session for second user
    const secondUserSessionPayload = {
      ...startMobileSessionInAppPayload(),
      alias: secondUser.alias,
      device: {
        ...startMobileSessionInAppPayload().device,
        in_app_permission: false
      }
    };

    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      secondUserSessionPayload
    );

    // Create Campaign
    const createCampaignInAppSmallTopWithUrlPayload =
      createCampaignInAppSmallTopWithUrl([
        createSegmentResponseJson.segment.id
      ]);

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

    await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      'Delivered'
    );

    // Start session for first user
    const firstUserSessionPayload = {
      ...startMobileSessionInAppPayload(),
      alias: firstUser.alias
    };

    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserSessionPayload
    );

    // First user performs actions
    const firstUserUpdatePayload = {
      ...updateMobileInAppUserPayload,
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

    // Second user doesn't perform any actions
    const secondUserUpdatePayload = {
      ...updateMobileInAppUserPayload,
      alias: secondUser.alias,
      user: {
        ...updateMobileInAppUserPayload.user,
        device: {
          ...updateMobileInAppUserPayload.user.device,
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
