import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_ACCESS_TOKEN_SDK,
  API_E2E_APP_ID,
  SUPER_ADMIN_ACCESS_TOKEN
} from '@_config/env.config';
import {
  createCampaignWithApi,
  deleteCampaignWithApi,
  getCampaignCombinedStatsWithApi,
  getCampaignsWithApi
} from '@_src/api/factories/campaigns.api.factory';
import {
  startMobileSessionWithApi,
  updateMobileUserWithApi
} from '@_src/api/factories/mobile.api.factory';
import { createSegmentWithApi } from '@_src/api/factories/segments.api.factory';
import { superAdminsFeatureFLagDefaultBatchUpdate } from '@_src/api/factories/super-admins.api.factory';
import { getAllUsersWithApi } from '@_src/api/factories/users.api.factory';
import { createCampaignPayloadInAppLarge } from '@_src/api/test-data/campaign/create-inapp-large-campaign-payload';
import { inAppDeliveryAction } from '@_src/api/test-data/mobile-user-actions/in-app/in-app-delivery-payload';
import { inAppDismissAction } from '@_src/api/test-data/mobile-user-actions/in-app/in-app-dismiss-payload';
import { inAppImpressionAction } from '@_src/api/test-data/mobile-user-actions/in-app/in-app-impression-payload';
import { startMobileSessionPayload } from '@_src/api/test-data/mobile-user-actions/start-mobile-session-payload';
import { updateMobileUserPayload } from '@_src/api/test-data/mobile-user-actions/update-mobile-user-payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/segment/create-segment-all-users-payload';
import {
  deleteAllCampaigns,
  deleteAllSegments,
  deleteAllUsers,
  importRandomUsers
} from '@_src/api/utils/apiDataManager.util';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/ui/models/user.model';

test.describe('In-App Campaign Tests', () => {
  const APIE2ELoginUserModel: APIE2ELoginUserModel = {
    apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
    apiE2EAccessTokenSuperAdmin: `${SUPER_ADMIN_ACCESS_TOKEN}`,
    apiE2EAppId: `${API_E2E_APP_ID}`
  };

  const APIE2ETokenSDKModel: APIE2ETokenSDKModel = {
    apiE2EAccessTokenSdk: `${API_E2E_ACCESS_TOKEN_SDK}`
  };

  test.beforeAll(async ({ request }) => {
    await superAdminsFeatureFLagDefaultBatchUpdate(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenSuperAdmin,
      ['APIE2ELoginUserModel.apiE2EAppId']
    );
  });

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

  test('should create and delete an In-App Large campaign', async ({
    request
  }) => {
    const numberOfUsers = 5;

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
    createCampaignPayloadInAppLarge.segment_ids = [
      createSegmentResponseJson.segment.id
    ];
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignPayloadInAppLarge
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignPayloadInAppLarge.name
    );

    // Get Campaigns
    const getCampaignsResponse = await getCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getCampaignsResponseJson = await getCampaignsResponse.json();

    const createdCampaign = getCampaignsResponseJson.data.find(
      (campaign: { id: string }) =>
        campaign.id === createCampaignResponseJson.id
    );

    // Assert Campaign Exists
    expect(createdCampaign).toBeDefined();
    expect(createdCampaign.name).toBe(createCampaignPayloadInAppLarge.name);

    // Delete Campaign
    await deleteCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createdCampaign.id
    );

    // Verify Deletion
    const getCampaignsResponseAfterDeletion = await getCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getCampaignsResponseJsonAfterDeletion =
      await getCampaignsResponseAfterDeletion.json();
    expect(getCampaignsResponseJsonAfterDeletion.data.length).toBe(0);
  });

  test('should create an In-App Large campaign with a dismiss button and update mobile session user to click it', async ({
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
    createCampaignPayloadInAppLarge.segment_ids = [
      createSegmentResponseJson.segment.id
    ];
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignPayloadInAppLarge
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert Campaign Created
    expect(createCampaignResponseJson.name).toBe(
      createCampaignPayloadInAppLarge.name
    );

    const getUsersResponse = await getAllUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getUsersResponseJson = await getUsersResponse.json();

    startMobileSessionPayload.alias = getUsersResponseJson.data[0].alias;
    updateMobileUserPayload.alias = getUsersResponseJson.data[0].alias;

    // Start Mobile Session
    await startMobileSessionWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionPayload
    );

    // Update Mobile User
    const userActions = [
      inAppDeliveryAction,
      inAppImpressionAction,
      inAppDismissAction
    ];

    userActions.forEach((action) => {
      action.guid = createCampaignResponseJson.guid;
    });

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      { ...updateMobileUserPayload, user_actions: userActions }
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
    expect(getCampaignCombinedStatsWithWaitResponseJson).toHaveProperty(
      'in_app'
    );
    expect(
      getCampaignCombinedStatsWithWaitResponseJson.in_app.send
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignCombinedStatsWithWaitResponseJson.in_app.delivery
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignCombinedStatsWithWaitResponseJson.in_app.dismiss
    ).toHaveProperty('total_uniq', 1);
    expect(
      getCampaignCombinedStatsWithWaitResponseJson.in_app.impression
    ).toHaveProperty('total_uniq', 1);
  });
});
