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
import { getInboxMessagesWithApi } from '@_src/api/factories/mobile.messages.api.factory';
import { startMobileSessionsWithApi } from '@_src/api/factories/mobile.sessions.api.factory';
import { updateMobileUserWithApi } from '@_src/api/factories/mobile.users.api.factory';
import { createSegmentWithApi } from '@_src/api/factories/segments.api.factory';
import { getCardCampaignStatsWithApi } from '@_src/api/factories/stats.api.factory';
import { getAllUsersWithApi } from '@_src/api/factories/users.api.factory';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/api/models/admin.model';
import { createCampaignFeedOneButtonToUrl } from '@_src/api/test-data/cms/campaign/create-feed-campaign.payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/cms/segment/create-segment-all-users.payload';
import { feedPostFrontButtonClickOneAction } from '@_src/api/test-data/mobile/actions/feed-post-front-button-click.payload';
import { feedPostFrontImpressionAction } from '@_src/api/test-data/mobile/actions/feed-post-impression.payload';
import { startMobileSessionFeedPayload } from '@_src/api/test-data/mobile/sessions/start-session.payload';
import { updateMobileFeedUserPayload } from '@_src/api/test-data/mobile/update/update-user.payload';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Feed Post Campaign', () => {
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

  test('should create an Feed Post campaign with a URL button and update mobile session user to click it', async ({
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
    const campaignPayload = createCampaignFeedOneButtonToUrl([
      createSegmentResponseJson.segment.id
    ]);
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      campaignPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(campaignPayload.name);

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

    const startMobileSessionFeedPayloadResponse =
      startMobileSessionFeedPayload();
    startMobileSessionFeedPayloadResponse.alias =
      getUsersResponseJson.data[0].alias;

    const alias = getUsersResponseJson.data[0].alias;
    updateMobileFeedUserPayload().alias = getUsersResponseJson.data[0].alias;

    // Start Mobile Session
    await startMobileSessionsWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionFeedPayloadResponse
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    const userAction = feedPostFrontButtonClickOneAction();

    // Update Mobile User
    const userActions = [feedPostFrontImpressionAction, userAction];

    userActions.forEach((action) => {
      action.guid = createCampaignResponseJson.guid;
    });

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      { ...updateMobileFeedUserPayload(), user_actions: userActions }
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      0
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
