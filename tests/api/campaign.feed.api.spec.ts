import { SUPER_ADMIN_ACCESS_TOKEN } from '@_config/env.config';
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
import { setupIsolatedCompany } from '@_src/api/utils/company-registration.util';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/data.manager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Feed Campaigns', () => {
  let APIE2ETokenSDKModel: APIE2ETokenSDKModel;
  let APIE2ELoginUserModel: APIE2ELoginUserModel;

  test.beforeAll(async ({ request }) => {
    // Create isolated company/app for this test file
    APIE2ELoginUserModel = await setupIsolatedCompany(
      request,
      SUPER_ADMIN_ACCESS_TOKEN
    );

    // Get SDK credentials using the new appId
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
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    await deleteAllUsers(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      APIE2ELoginUserModel.apiE2EAppId
    );
  });

  test('should create feed campaign with URL button', async ({ request }) => {
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
      createSegmentAllUsersPayload(),
      APIE2ELoginUserModel.apiE2EAppId
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Create Campaign
    const campaignPayload = createCampaignFeedOneButtonToUrl([
      createSegmentResponseJson.segment.id
    ]);
    const createCampaignResponseJson = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      campaignPayload,
      APIE2ELoginUserModel.apiE2EAppId
    );

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(campaignPayload.name);

    await getCampaignDetailsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignResponseJson.id,
      'Delivered',
      APIE2ELoginUserModel.apiE2EAppId
    );

    const getUsersResponseJson = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      { appId: APIE2ELoginUserModel.apiE2EAppId }
    );

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
      {
        ...updateMobileFeedUserPayload(),
        alias: alias,
        user_actions: userActions
      }
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
      1,
      undefined,
      APIE2ELoginUserModel.apiE2EAppId
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
