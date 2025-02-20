import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_ACCESS_TOKEN_SDK,
  API_E2E_APP_ID,
  API_E2E_APP_ID_SDK,
  API_E2E_APP_KEY_SDK,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import { createCampaignWithApi } from '@_src/api/factories/campaigns.api.factory';
import { getInboxMessagesWithApi } from '@_src/api/factories/mobile.messages.api.factory';
import { startMobileSessionsWithApi } from '@_src/api/factories/mobile.sessions.api.factory';
import { updateMobileUserWithApi } from '@_src/api/factories/mobile.users.api.factory';
import { createSegmentWithApi } from '@_src/api/factories/segments.api.factory';
import { getCampaignStatsWithApi } from '@_src/api/factories/stats.api.factory';
import { getAllUsersWithApi } from '@_src/api/factories/users.api.factory';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/api/models/admin.model';
import { createFeedCampaignFrontBackButtonToDeepLink } from '@_src/api/test-data/cms/campaign/create-feed-campaign.payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/cms/segment/create-segment-all-users.payload';
import { startMobileSessionFeedPayload } from '@_src/api/test-data/mobile/sessions/mobile.sessions.payload';
import { feedPostBackButtonClickOneAction } from '@_src/api/test-data/mobile/users/card/feed-post-back-button-click.payload';
import { feedPostFrontImpressionAction } from '@_src/api/test-data/mobile/users/card/feed-post-impression.payload';
import { updateMobileUserPayload } from '@_src/api/test-data/mobile/users/update/mobile.users.update.payload';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/apiDataManager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('Feed Post Campaign Tests', () => {
  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  const APIE2ETokenSDKModel: APIE2ETokenSDKModel = {
    apiE2EAccessTokenSdk: `${API_E2E_ACCESS_TOKEN_SDK}`
  };

  test.beforeEach(async ({ request }) => {
    await deleteAllUsers(request, APIE2ELoginUserModel.apiE2EAccessTokenAdmin);

    await deleteAllSegments(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );

    await deleteAllCampaigns(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
  });

  test('should create an Feed Post campaign with a URL button and update mobile session user to click it', async ({
    request,
    page
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
    createFeedCampaignFrontBackButtonToDeepLink.segment_ids = [
      createSegmentResponseJson.segment.id
    ];
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createFeedCampaignFrontBackButtonToDeepLink
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createFeedCampaignFrontBackButtonToDeepLink.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionFeedPayload.alias = getUsersResponseJson.data[0].alias;
    const alias = getUsersResponseJson.data[0].alias;
    updateMobileUserPayload.alias = getUsersResponseJson.data[0].alias;

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
    // Visit the feed page in mobile view
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X dimensions
    const feedUrl = `https://sdk.furiousapi.com/feed?sdkAppId=${API_E2E_APP_ID_SDK}&sdkAppKey=${API_E2E_APP_KEY_SDK}&alias=${alias}&deviceGuid=${startMobileSessionFeedPayload.device.token}`;
    await page.goto(feedUrl);

    // Wait for the feed to load and take a screenshot
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Give extra time for dynamic content to load
    await page.screenshot({ path: 'feed-page.png' });

    // Click the back button
    const buttonSelector = 'a.text-center:has-text("Button_Card_Back")';
    await page.waitForSelector(buttonSelector);
    await page.click(buttonSelector);

    await getInboxMessagesWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      alias,
      0
    );

    const getCampaignStatsWithWaitResponse = await getCampaignStatsWithApi(
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
