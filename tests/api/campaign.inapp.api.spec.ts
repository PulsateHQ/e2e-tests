import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_ACCESS_TOKEN_SDK,
  API_E2E_APP_ID
} from '@_config/env.config';
import {
  batchDeleteCampaignsWithApi,
  createCampaignWithApi,
  deleteCampaignWithApi,
  getCampaignCombinedStatsWithWait,
  getCampaignsWithApi
} from '@_src/api/factories/campaigns.api.factory';
import { importUsersWithApi } from '@_src/api/factories/import-users.api.factory';
import {
  startMobileSessionWithApi,
  updateMobileUserWithApi
} from '@_src/api/factories/mobile.api.factory';
import {
  batchDeleteSegmentsWithApi,
  createSegmentWithApi,
  getSegmentsWithApi
} from '@_src/api/factories/segments.api.factory';
import { createCampaignPayload } from '@_src/api/test-data/create-inapp-large-campaign-payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/create-segment-all-users-payload';
import { startMobileSessionPayload } from '@_src/api/test-data/start-mobile-session-payload';
import { updateMobileUserPayload } from '@_src/api/test-data/update-mobile-user-payload';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import {
  APIE2ELoginUserModel,
  APIE2ETokenSDKModel
} from '@_src/ui/models/user.model';

test.describe('Campaign and Segment Management', () => {
  test('should import users, create segment and create campaign, get campaign and remove campaign', async ({
    request
  }) => {
    // Arrange
    const APIE2ELoginUserModel: APIE2ELoginUserModel = {
      apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
      apiE2EAppId: `${API_E2E_APP_ID}`
    };
    const csvFilePath = 'src/api/test-data/import.data.users.csv';

    // Act (Import Users)
    await importUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      {
        file: csvFilePath,
        app_id: APIE2ELoginUserModel.apiE2EAppId
      }
    );

    // Act (Get Segments)
    const getSegmentsResponseBeforeCampaign = await getSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getSegmentsResponseBeforeCampaignJSON =
      await getSegmentsResponseBeforeCampaign.json();

    // Act (Batch Delete Segments)
    await batchDeleteSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      getSegmentsResponseBeforeCampaignJSON.data.map(
        (segment: { id: string }) => segment.id
      )
    );

    // Act (Get Campaigns)
    const getCampaignsResponseBeforeCampaign = await getCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getCampaignsResponseBeforeCampaignJson =
      await getCampaignsResponseBeforeCampaign.json();

    // Act (Batch Delete Campaigns)
    await batchDeleteCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      getCampaignsResponseBeforeCampaignJson.data.map(
        (campaign: { id: string }) => campaign.id
      )
    );

    // Act (Create Segment)
    const segmentsResponseAfterCreation = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const getSegmentsResponseJsonAfterCreation =
      await segmentsResponseAfterCreation.json();

    // Act (Create Campaign)
    createCampaignPayload.segment_ids = [
      getSegmentsResponseJsonAfterCreation.segment.id
    ];
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert (Campaign Created)
    expect(createCampaignResponseJson).toHaveProperty(
      'name',
      createCampaignPayload.name
    );

    // Act (Get Campaigns)
    const getCampaignsResponse = await getCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getCampaignsResponseJson = await getCampaignsResponse.json();

    const createdCampaign = getCampaignsResponseJson.data.find(
      (campaign: { id: string }) =>
        campaign.id === createCampaignResponseJson.id
    );

    // Assert (Campaign Exists)
    expect(createdCampaign).toBeDefined();
    expect(createdCampaign.name).toBe(createCampaignPayload.name);

    // Act (Delete Campaign)
    await deleteCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createdCampaign.id
    );

    // Assert (Verify Deletion)
    const getCampaignsResponseAfterDeletion = await getCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getCampaignsResponseJsonAfterDeletion =
      await getCampaignsResponseAfterDeletion.json();
    expect(getCampaignsResponseJsonAfterDeletion.data.length).toBe(0);
  });

  test('should create segment and create campaign, start mobile session user and update mobile session user', async ({
    request
  }) => {
    // Arrange
    const APIE2ELoginUserModel: APIE2ELoginUserModel = {
      apiE2EAccessTokenAdmin: `${API_E2E_ACCESS_TOKEN_ADMIN}`,
      apiE2EAppId: `${API_E2E_APP_ID}`
    };

    const csvFilePath = 'src/api/test-data/import.data.users.csv';

    const APIE2ETokenSDKModel: APIE2ETokenSDKModel = {
      apiE2EAccessTokenSdk: `${API_E2E_ACCESS_TOKEN_SDK}`
    };

    // Act (Import Users)
    await importUsersWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      {
        file: csvFilePath,
        app_id: APIE2ELoginUserModel.apiE2EAppId
      }
    );

    // Act (Get Campaigns)
    const getCampaignsResponseBeforeCampaign = await getCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getCampaignsResponseBeforeCampaignJson =
      await getCampaignsResponseBeforeCampaign.json();

    // Act (Batch Delete Campaign)
    await batchDeleteCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      getCampaignsResponseBeforeCampaignJson.data.map(
        (campaign: { id: string }) => campaign.id
      )
    );

    // Act (Create Segment)
    const segmentsResponseAfterCreation = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentAllUsersPayload
    );
    const getSegmentsResponseJsonAfterCreation =
      await segmentsResponseAfterCreation.json();

    // Act (Create Campaign)
    createCampaignPayload.segment_ids = [
      getSegmentsResponseJsonAfterCreation.segment.id
    ];
    const createCampaignResponse = await createCampaignWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createCampaignPayload
    );
    const createCampaignResponseJson = await createCampaignResponse.json();

    // Assert (Campaign Created)
    expect(createCampaignResponseJson).toHaveProperty(
      'name',
      createCampaignPayload.name
    );

    // Act (Get Campaigns)
    const getCampaignsResponse = await getCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getCampaignsResponseJson = await getCampaignsResponse.json();

    const createdCampaign = getCampaignsResponseJson.data.find(
      (campaign: { id: string }) =>
        campaign.id === createCampaignResponseJson.id
    );

    // Assert (Campaign Exists)
    expect(createdCampaign).toBeDefined();
    expect(createdCampaign.name).toBe(createCampaignPayload.name);

    // Act (Start Mobile Session)
    await startMobileSessionWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      startMobileSessionPayload
    );

    // Act (Update Mobile User)
    updateMobileUserPayload.user_actions.forEach((action) => {
      action.guid = createCampaignResponseJson.guid;
    });

    await updateMobileUserWithApi(
      request,
      APIE2ETokenSDKModel.apiE2EAccessTokenSdk,
      updateMobileUserPayload
    );

    // Act (Get Campaign Combined Stats)
    const getCampaignCombinedStatsWithWaitResponse =
      await getCampaignCombinedStatsWithWait(
        request,
        APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
        createCampaignResponseJson.id
      );

    const getCampaignCombinedStatsWithWaitResponseJson =
      await getCampaignCombinedStatsWithWaitResponse.json();

    // Assert (Validate Response Body)
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
