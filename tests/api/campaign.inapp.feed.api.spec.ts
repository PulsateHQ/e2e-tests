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
import { updateDeeplinkWithApi } from '@_src/api/factories/deeplinks.api.factory';
import { createDeeplinkWithApi } from '@_src/api/factories/deeplinks.api.factory';
import { getInboxMessagesWithApi } from '@_src/api/factories/mobile.messages.api.factory';
import { getCardWithApi } from '@_src/api/factories/mobile.notifications.api.factory';
import { startMobileSessionsWithApi } from '@_src/api/factories/mobile.sessions.api.factory';
import { updateMobileUserWithApi } from '@_src/api/factories/mobile.users.api.factory';
import { createSegmentWithApi } from '@_src/api/factories/segments.api.factory';
import {
  getCampaignBackCardStatsWithApi,
  getCardCampaignStatsWithApi,
  getInAppCardCampaignStatsWithApi
} from '@_src/api/factories/stats.api.factory';
import { getAllUsersWithApi } from '@_src/api/factories/users.api.factory';
import { createWebSdkStatistics } from '@_src/api/factories/web.sdk.api.factory';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/api/models/admin.model';
import { InAppEvents } from '@_src/api/models/mobile.users.model';
import { WebSdkStatisticsAction } from '@_src/api/models/web.sdk.model';
import { createCampaignFeedOneButtonToUrl } from '@_src/api/test-data/cms/campaign/create-feed-campaign.payload';
import { createCampaignInAppLargeWithOpenFeed } from '@_src/api/test-data/cms/campaign/create-inapp-campaign.payload';
import {
  createCampaignLargeInAppWithFeedCardFrontBack,
  createCampaignSmallInAppWithCard
} from '@_src/api/test-data/cms/campaign/create-inapp-feed-campaign.payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/cms/segment/create-segment-all-users.payload';
import { startMobileSessionFeedPayload } from '@_src/api/test-data/mobile/sessions/start-session.payload';
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

test.describe('In-App Campaign with Feed', () => {
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
      apiE2EAccessTokenSdk: sdkCredentials.access_token,
      apiE2EAppIdSdk: sdkCredentials.app_id,
      apiE2EAppKeySdk: sdkCredentials.app_key
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

  test('should create an In-App small campaign with button to open specific feed', async ({
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

    // Prepare Deeplink
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
    const createCampaignSmallInAppWithCardPayload =
      createCampaignSmallInAppWithCard(
        [createSegmentResponseJson.segment.id],
        updateDeeplinkResponse.id
      );

    // Create InApp plus Feed Campaign
    const createInAppFeedCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignSmallInAppWithCardPayload
    );
    const createInAppFeedCampaignResponseJson =
      await createInAppFeedCampaignResponse.json();

    // Assert Campaign Created
    expect(createInAppFeedCampaignResponseJson.name).toBe(
      createCampaignSmallInAppWithCardPayload.name
    );

    await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createInAppFeedCampaignResponseJson.id,
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
    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;

    // Start session for first user
    const firstUserSessionPayload = {
      ...startMobileSessionInAppPayload,
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
          guid: createInAppFeedCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_IMPRESSION],
          guid: createInAppFeedCampaignResponseJson.guid
        }
      ]
    };

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserUpdatePayload
    );

    // Start Mobile Session
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionFeedPayload
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    const getCardWithApiResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createInAppFeedCampaignResponseJson.guid
    );

    const getCardWithApiResponseJson = await getCardWithApiResponse.json();

    // Validate card matches campaign configuration
    expect(getCardWithApiResponseJson.campaign_guid).toBe(
      createInAppFeedCampaignResponseJson.guid
    );

    // Find parts in card response
    const callToActionPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'call_to_action'
    );

    // Validate call to action part matches campaign configuration
    const campaignCallToAction =
      createInAppFeedCampaignResponseJson.card_notification.front_parts
        .call_to_action;
    expect(callToActionPart.active).toBe(campaignCallToAction.active);
    expect(callToActionPart.position).toBe(campaignCallToAction.position);

    // Validate button attributes match exactly
    const buttonAttrs = callToActionPart.attrs[0];
    const campaignButton = campaignCallToAction.buttons[0];
    expect(buttonAttrs.btn_color).toBe(campaignButton.btn_color);
    expect(buttonAttrs.destination_type).toBe(campaignButton.destination_type);
    expect(buttonAttrs.destination).toBe(campaignButton.destination);
    expect(buttonAttrs.in_app_events).toBe(campaignButton.in_app_events);
    expect(buttonAttrs.label).toBe(campaignButton.label);
    expect(buttonAttrs.txt_color).toBe(campaignButton.txt_color);
    expect(buttonAttrs.order_number).toBe(campaignButton.order_number);

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createInAppFeedCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createInAppFeedCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_ONE
    );

    const getCampaignStatsWithWaitResponse =
      await getInAppCardCampaignStatsWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        createInAppFeedCampaignResponseJson.id,
        1,
        1,
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

    expect(getCampaignStatsWithWaitResponseJson).toHaveProperty('card');
    expect(getCampaignStatsWithWaitResponseJson.card.send).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.delivery).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.clicks).toHaveProperty(
      'total_uniq',
      1
    );
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_button_click_one
    ).toHaveProperty('total_uniq', 1);
  });

  test('should create an In-App Large campaign with button to open feed inbox', async ({
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

    // Create Feed Campaign
    const createCampaignFeedOneButtonToUrlPayload =
      createCampaignFeedOneButtonToUrl([createSegmentResponseJson.segment.id]);

    const createFeedCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonToUrlPayload
    );
    const createFeedCampaignResponseJson =
      await createFeedCampaignResponse.json();

    // Assert Campaign Created
    expect(createFeedCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonToUrlPayload.name
    );

    await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createFeedCampaignResponseJson.id,
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
    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;

    // Start Mobile Session
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionFeedPayload
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    const getCardWithApiResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createFeedCampaignResponseJson.guid
    );

    const getCardWithApiResponseJson = await getCardWithApiResponse.json();

    // Validate card matches campaign configuration
    expect(getCardWithApiResponseJson.campaign_guid).toBe(
      createFeedCampaignResponseJson.guid
    );

    // Create InApp Campaign
    const createCampaignInAppLargeWithOpenFeedPayload =
      createCampaignInAppLargeWithOpenFeed([
        createSegmentResponseJson.segment.id
      ]);
    const createInAppCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignInAppLargeWithOpenFeedPayload
    );
    const createInAppCampaignResponseJson =
      await createInAppCampaignResponse.json();

    // Assert Campaign Created
    expect(createInAppCampaignResponseJson.name).toBe(
      createCampaignInAppLargeWithOpenFeedPayload.name
    );

    await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createInAppCampaignResponseJson.id,
      'Delivered'
    );

    // Start session for first user
    const firstUserSessionPayload = {
      ...startMobileSessionInAppPayload,
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
          guid: createInAppCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_IMPRESSION],
          guid: createInAppCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_BUTTON_CLICK_ONE],
          guid: createInAppCampaignResponseJson.guid
        }
      ]
    };

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserUpdatePayload
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    const getCardWithApiAfterInAppResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createFeedCampaignResponseJson.guid
    );

    const getCardWithApiAfterInAppResponseJson =
      await getCardWithApiAfterInAppResponse.json();

    // Validate card matches campaign configuration
    expect(getCardWithApiAfterInAppResponseJson.campaign_guid).toBe(
      createFeedCampaignResponseJson.guid
    );

    const getCampaignStatsWithWaitResponse = await getCardCampaignStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createInAppCampaignResponseJson.id,
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

  test('should create a Large In-App campaign with button to open feed card with front and back sides', async ({
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

    // Prepare Deeplink for the back side button
    await deleteAllDeeplinks(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );

    const createDeeplinkResponse = await createDeeplinkWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      {
        nickname: 'CardBackDeeplink',
        target: `${apiUrls.campaigns.v2.base}`
      }
    );

    // Preparing payload for campaign creation
    const createCampaignLargeInAppWithFeedCardFrontBackPayload =
      createCampaignLargeInAppWithFeedCardFrontBack(
        [createSegmentResponseJson.segment.id],
        createDeeplinkResponse.id
      );

    // Create Large InApp plus Feed Campaign with front/back
    const createInAppFeedCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignLargeInAppWithFeedCardFrontBackPayload
    );
    const createInAppFeedCampaignResponseJson =
      await createInAppFeedCampaignResponse.json();

    // Assert Campaign Created
    expect(createInAppFeedCampaignResponseJson.name).toBe(
      createCampaignLargeInAppWithFeedCardFrontBackPayload.name
    );

    await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createInAppFeedCampaignResponseJson.id,
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
    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;

    // Start session for first user
    const firstUserSessionPayload = {
      ...startMobileSessionInAppPayload,
      alias: firstUser.alias
    };
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserSessionPayload
    );

    // STEP 1: First user interacts with the large in-app notification
    const firstUserUpdatePayload = {
      ...updateMobileInAppUserPayload,
      alias: firstUser.alias,
      user_actions: [
        {
          ...userActions[InAppEvents.IN_APP_DELIVERY],
          guid: createInAppFeedCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_IMPRESSION],
          guid: createInAppFeedCampaignResponseJson.guid
        },
        {
          ...userActions[InAppEvents.IN_APP_BUTTON_CLICK_ONE],
          guid: createInAppFeedCampaignResponseJson.guid
        }
      ]
    };

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUserUpdatePayload
    );

    // Start Mobile Session for feed
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionFeedPayload
    );

    // Get messages from inbox
    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    // STEP 2: Get the feed card for further interactions
    const getCardWithApiResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      createInAppFeedCampaignResponseJson.guid
    );

    const getCardWithApiResponseJson = await getCardWithApiResponse.json();

    // Validate card matches campaign configuration
    expect(getCardWithApiResponseJson.campaign_guid).toBe(
      createInAppFeedCampaignResponseJson.guid
    );

    // Find call to action part in card response
    const callToActionPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'call_to_action'
    );

    // Validate front side call to action matches campaign configuration
    expect(callToActionPart).toBeDefined();
    expect(callToActionPart.attrs[0].destination_type).toBe('card_back');

    // STEP 3: User views the front side of the card and flips to back
    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createInAppFeedCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createInAppFeedCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_ONE
    );

    // STEP 4: User now views the back side of the card and clicks deeplink
    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createInAppFeedCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_BACK_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      alias,
      createInAppFeedCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_BACK_BUTTON_CLICK_ONE
    );

    // Get campaign stats with wait for all the interactions to be processed
    // Including specific counts for the back side interactions
    const getCampaignStatsWithWaitResponse =
      await getCampaignBackCardStatsWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        createInAppFeedCampaignResponseJson.id,
        1,
        1,
        1
      );

    const getCampaignStatsWithWaitResponseJson =
      await getCampaignStatsWithWaitResponse.json();

    // Validate In-App notification statistics
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

    // Validate Card statistics including both front and back interactions
    expect(getCampaignStatsWithWaitResponseJson).toHaveProperty('card');
    expect(getCampaignStatsWithWaitResponseJson.card.send).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.delivery).toHaveProperty(
      'total_uniq',
      1
    );
    expect(getCampaignStatsWithWaitResponseJson.card.clicks).toHaveProperty(
      'total_uniq',
      1
    );

    // Front side statistics
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.front.front_button_click_one
    ).toHaveProperty('total_uniq', 1);

    // Back side statistics
    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignStatsWithWaitResponseJson.card.back.back_button_click_one
    ).toHaveProperty('total_uniq', 1);
  });
});
