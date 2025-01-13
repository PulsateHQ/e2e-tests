import { CreateCampaignPayload } from '@_src/api/models/create-campaigns.api.model';
import { faker } from '@faker-js/faker/locale/en';

export const createCampaignPayloadFeedPost: CreateCampaignPayload = {
  state_machine_notifications_state: 'initial',
  duplication_source_id: '',
  type: 'CardInboxCampaign',
  last_builder_page: '1',
  name: `${faker.lorem.word()}_Feed_Post_Campaign`,
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
  card_notification: {
    front_parts: {
      admin_header_with_message: {
        side: 'front',
        position: -1,
        active: false,
        message: '',
        admin: {
          job_title: null,
          name: 'e2e_tiger_api',
          avatar_url:
            'https://pulsate-media-bucket-production.s3.eu-west-1.amazonaws.com/default-user-avatar.png',
          s_id: '672cc369b58b2cc1937b68cd'
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
        text: `${faker.lorem.word()}_Text_Feed_Post_Campaigns`,
        position: 2
      },
      call_to_action: {
        buttons: [
          {
            label: `${faker.lorem.word()}_Button_URL`,
            destination_type: 'url',
            destination: 'https://google.com',
            txt_color: '',
            btn_color: ''
          }
        ],
        side: 'front'
      }
    },
    type: 'card',
    goals: []
  },
  segment_ids: [],
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
