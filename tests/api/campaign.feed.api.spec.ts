import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_ACCESS_TOKEN_SDK,
  API_E2E_APP_ID
} from '@_config/env.config';
import {
  createCampaignWithApi,
  getCampaignCombinedStatsWithApi
} from '@_src/api/factories/campaigns.api.factory';
import {
  getInboxMessagesWithApi,
  startMobileSessionWithApi,
  updateMobileUserWithApi
} from '@_src/api/factories/mobile.api.factory';
import { createSegmentWithApi } from '@_src/api/factories/segments.api.factory';
import { getUsersWithApi } from '@_src/api/factories/users.api.factory';
import { createCampaignPayloadFeedPost } from '@_src/api/test-data/create-feed-campaign-payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/create-segment-all-users-payload';
import { startMobileSessionPayload } from '@_src/api/test-data/start-mobile-session-payload';
import { updateMobileUserPayload } from '@_src/api/test-data/update-mobile-user-payload';
import { feedPostFrontButtonClickOneAction } from '@_src/api/test-data/user-actions/feed-post-button-click-payload';
import { feedPostFrontImpressionAction } from '@_src/api/test-data/user-actions/feed-post-impression-payload';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/apiTestUtils.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/ui/models/user.model';

test.describe('Feed Post Campaign Tests', () => {
  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  const APIE2ETokenSDKModel: APIE2ETokenSDKModel = {
    apiE2EAccessTokenSdk: `${API_E2E_ACCESS_TOKEN_SDK}`
  };

  test.beforeEach(async ({ request }) => {
    await deleteAllCampaigns(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    await deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin);
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
      createSegmentAllUsersPayload
    );
    const createSegmentResponseJson = await createSegmentResponse.json();

    // Create Campaign
    createCampaignPayloadFeedPost.segment_ids = [
      createSegmentResponseJson.segment.id
    ];
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignPayloadFeedPost
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignPayloadFeedPost.name
    );

    const getUsersResponse = await getUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileUserPayload.alias = getUsersResponseJson.data[0].alias;

    // Start Mobile Session
    await startMobileSessionWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionPayload
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      1
    );

    // await getMessagesWithApi(
    //   request,
    //   APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
    //   alias,
    //   campaignGuid
    // );

    // Update Mobile User
    const userActions = [
      feedPostFrontImpressionAction,
      feedPostFrontButtonClickOneAction
    ];

    userActions.forEach((action) => {
      action.guid = createCampaignResponseJson.guid;
    });

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      { ...updateMobileUserPayload, user_actions: userActions }
    );

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      0
    );

    const getCampaignCombinedStatsWithWaitResponse =
      await getCampaignCombinedStatsWithApi(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        createCampaignResponseJson.id,
        1
      );

    const getCampaignCombinedStatsWithWaitResponseJson =
      await getCampaignCombinedStatsWithWaitResponse.json();

    // Assert Validate Response Body
    expect(getCampaignCombinedStatsWithWaitResponseJson).toHaveProperty('card');
    expect(
      getCampaignCombinedStatsWithWaitResponseJson.card.send
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignCombinedStatsWithWaitResponseJson.card.delivery
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignCombinedStatsWithWaitResponseJson.card.clicks
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignCombinedStatsWithWaitResponseJson.card.front.front_impression
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignCombinedStatsWithWaitResponseJson.card.front
        .front_button_click_one
    ).toHaveProperty('total_uniq', 1);
  });
});
