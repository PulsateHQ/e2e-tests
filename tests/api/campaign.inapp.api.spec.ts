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
import { CreateCampaignPayload } from '@_src/api/models/create-campaigns.api.model';
import { CreateSegmentPayload } from '@_src/api/models/create-segment.api.model';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';
import { APIE2ELoginUserModel } from '@_src/ui/models/user.model';
import { faker } from '@faker-js/faker';

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

    // Act

    // Act (Get Segments)
    const getSegmentsResponseBeforeCampgain = await getSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getSegmentsResponseBeforeCampgainJson =
      await getSegmentsResponseBeforeCampgain.json();

    // Act (Batch Delete Camping)
    await batchDeleteCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      getSegmentsResponseBeforeCampgainJson.data.map(
        (segment: { id: string }) => segment.id
      )
    );

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
    const getCampaignsResponse1 = await getCampaignsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin
    );
    const getCampaignsResponseJson1 = await getCampaignsResponse1.json();

    // Act (Batch Delete Segments)
    await batchDeleteSegmentsWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      getCampaignsResponseJson1.data.map(
        (campaign: { id: string }) => campaign.id
      )
    );

    // Act (Create Segment)
    const createSegmentPayload: CreateSegmentPayload = {
      name: faker.lorem.word(),
      groups: [
        {
          join_type: '+',
          rules: [
            {
              type: 'all_users',
              match_type: 'equal',
              match_value: 'true'
            }
          ]
        }
      ]
    };

    // Act (Get Segments Again)
    const segmentsResponseAfterCreation = await createSegmentWithApi(
      request,
      APIE2ELoginUserModel.apiE2EAccessTokenAdmin,
      createSegmentPayload
    );
    const getSegmentsResponseJsonAfterCreation =
      await segmentsResponseAfterCreation.json();

    // Act (Create Campaign)
    const createCampaignPayload: CreateCampaignPayload = {
      state_machine_notifications_state: 'initial',
      duplication_source_id: '',
      type: 'InAppNotificationCampaign',
      last_builder_page: '1',
      name: `${faker.lorem.word()}Campaigns`,
      control_group: null,
      goals: [
        {
          primary: true,
          event_kind: 'open_app',
          event_identifier: null,
          expiry_time_unit: 'hours',
          expiry_time_value: 1
        }
      ],
      in_app_notification: {
        large: {
          admin_header_with_message: {
            side: 'front',
            position: -1,
            active: false,
            message: '',
            admin: {
              job_title: null,
              name: null,
              avatar_url: null,
              s_id: null
            }
          },
          image: {
            side: 'front',
            name: '',
            active: false,
            position: 0,
            url: ''
          },
          headline: {
            side: 'front',
            active: false,
            text: '',
            position: 1
          },
          text: {
            side: 'front',
            active: true,
            text: faker.lorem.sentence(),
            position: 2
          },
          call_to_action: {
            buttons: [
              {
                label: faker.lorem.word(),
                destination_type: 'dismiss',
                txt_color: '',
                btn_color: ''
              }
            ],
            side: 'front'
          }
        }
      },
      segment_ids: [getSegmentsResponseJsonAfterCreation.segment.id],
      beacon_ids: [],
      geofence_ids: [],
      in_app_event_names: [],
      beacon_events: {},
      geofence_events: {},
      geofence_dwelling_times: {},
      start_now: true,
      start_at: new Date().toISOString().slice(0, 19),
      end_at: '',
      time_frame: 'weeks',
      time_value: '',
      time_zone_name: 'Europe/Warsaw',
      time_zone_offset: '+01:00',
      delivery: 'current',
      campaign_limits: false,
      campaign_expiry: false
    };
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
      getCampaignsResponseJson.data[0].id
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
});
