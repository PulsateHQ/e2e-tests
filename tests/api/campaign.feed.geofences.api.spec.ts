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
import { getInboxMessagesWithApi } from '@_src/api/factories/mobile.messages.api.factory';
import { getCardWithApi } from '@_src/api/factories/mobile.notifications.api.factory';
import { startMobileSessionsForGeofenceWithApi } from '@_src/api/factories/mobile.sessions.api.factory';
import { getCardCampaignStatsWithApi } from '@_src/api/factories/stats.api.factory';
import {
  getAllUsersWithApi,
  getUserGeofenceEventsWithApi
} from '@_src/api/factories/users.api.factory';
import { createWebSdkStatistics } from '@_src/api/factories/web.sdk.api.factory';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/api/models/admin.model';
import { WebSdkStatisticsAction } from '@_src/api/models/web.sdk.model';
import { createCampaignFeedOneButtonToUrl } from '@_src/api/test-data/cms/campaign/create-feed-campaign.payload';
import { geofencePayload } from '@_src/api/test-data/cms/geofence/geofence.payload';
import { startMobileSessionInAppPayload } from '@_src/api/test-data/mobile/sessions/start-session.payload';
import {
  deleteAllCampaigns,
  deleteAllGeofences,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { isRunningInEnvironment } from '@_src/api/utils/skip.environment.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Geofence Feed Campaign', () => {
  let APIE2ETokenSDKModel: APIE2ETokenSDKModel;

  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  // Define the environments where this test should run
  const SUPPORTED_ENVIRONMENTS = ['tiger', 'puma'];

  test.beforeAll(async ({ request }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      !isRunningInEnvironment(SUPPORTED_ENVIRONMENTS),
      `Test only runs in environments: ${SUPPORTED_ENVIRONMENTS.join(', ')}`
    );
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
    await deleteAllGeofences(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
  });

  test('should create a enter geofence an HTML Feed campaign with a URL button and click it', async ({
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
      geofencePayload
    );
    const createGeofenceResponseJson = await createGeofenceResponse.json();

    // Prepare Campaign Payload

    createCampaignFeedOneButtonToUrl.geofence_ids = [
      createGeofenceResponseJson.id
    ];
    createCampaignFeedOneButtonToUrl.geofence_events = {
      [createGeofenceResponseJson.id]: 'enter'
    };

    // Create Campaign
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignFeedOneButtonToUrl
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignFeedOneButtonToUrl.name
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

    // First user - will perform actions
    const firstUser = getUsersResponseJson.data[0];

    // Start session for first user
    const firstUserSessionPayload = {
      ...startMobileSessionInAppPayload,
      alias: firstUser.alias,
      current_location: createGeofenceResponseJson.location
    };

    // Start Mobile Session
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

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUser.alias,
      1
    );

    const getCardWithApiResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUser.alias,
      createCampaignResponseJson.guid
    );

    const getCardWithApiResponseJson = await getCardWithApiResponse.json();

    // Validate card matches campaign configuration
    expect(getCardWithApiResponseJson.campaign_guid).toBe(
      createCampaignResponseJson.guid
    );

    // Find parts in card response
    const callToActionPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'call_to_action'
    );
    const textPart = getCardWithApiResponseJson.front.find(
      (part) => part.type === 'text'
    );

    // Validate call to action part matches campaign configuration
    const campaignCallToAction =
      createCampaignResponseJson.card_notification.front_parts.call_to_action;
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

    // Validate text part matches campaign configuration
    const campaignText =
      createCampaignResponseJson.card_notification.front_parts.text;
    expect(textPart.active).toBe(campaignText.active);
    expect(textPart.position).toBe(campaignText.position);
    expect(textPart.attrs[0].text).toBe(campaignText.text);

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      firstUser.alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_IMPRESSION
    );

    await createWebSdkStatistics(
      request,
      APIE2ETokenSDKModel.apiE2EAppIdSdk,
      APIE2ETokenSDKModel.apiE2EAppKeySdk,
      firstUser.alias,
      createCampaignResponseJson.guid,
      WebSdkStatisticsAction.CARD_FRONT_BUTTON_CLICK_ONE
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUser.alias,
      0
    );

    const getCardWithApiAfterReadingResponse = await getCardWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      firstUser.alias,
      createCampaignResponseJson.guid
    );

    const getCardWithApiAfterReadingResponseJson =
      await getCardWithApiAfterReadingResponse.json();

    expect(getCardWithApiAfterReadingResponseJson.is_campaign_unread).toBe(
      false
    );

    const getCampaignStatsWithWaitResponse = await getCardCampaignStatsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      1
    );

    const getCampaignStatsWithWaitResponseJson =
      await getCampaignStatsWithWaitResponse.json();

    // Assert Validate Response Body
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
});
