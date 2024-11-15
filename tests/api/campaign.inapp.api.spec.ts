// tests/api/campaign.inapp.api.spec.ts
import {
  API_E2E_ACCESS_TOKEN_ADMIN,
  API_E2E_APP_ID
} from '@_config/env.config';
import {
  batchDeleteCampaignsWithApi,
  createCampaignWithApi,
  deleteCampaignWithApi,
  getCampaignsWithApi
} from '@_src/api/factories/campaigns.api.factory';
import { importUsersWithApi } from '@_src/api/factories/import-users.api.factory';
import {
  batchDeleteSegmentsWithApi,
  createSegmentWithApi,
  getSegmentsWithApi
} from '@_src/api/factories/segments.api.factory';
import { createCampaignPayload } from '@_src/api/test-data/create-inapp-large-campaign-payload';
import { createSegmentAllUsersPayload } from '@_src/api/test-data/create-segment-all-users-payload';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { APIE2ELoginUserModel } from '@_src/ui/models/user.model';

test.describe('Test', () => {
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

    // Act
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
    expect(createdCampaign).toBeDefined();
    expect(createdCampaign.name).toBe(createCampaignPayload.name);
  });
});
