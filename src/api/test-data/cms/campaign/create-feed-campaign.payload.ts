import { CreateCampaignPayload } from '@_src/api/models/campaign.model';
import { faker } from '@faker-js/faker/locale/en';

export const createCampaignFeedButtonToUrl: CreateCampaignPayload = {
  state_machine_notifications_state: 'initial',
  duplication_source_id: '',
  type: 'CardInboxCampaign',
  last_builder_page: '1',
  name: `Feed_Post_Campaign_Button_URL_${faker.lorem.word()}`,
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
        text: `Text_Feed_Post_Campaigns_${faker.lorem.word()}`,
        position: 2
      },
      call_to_action: {
        buttons: [
          {
            label: `Button_URL_${faker.lorem.word()}`,
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

export const createFeedCampaignFrontBackButtonToDeepLink: CreateCampaignPayload =
  {
    state_machine_notifications_state: 'initial',
    duplication_source_id: '',
    type: 'CardInboxCampaign',
    last_builder_page: '1',
    name: `Feed_Post_Campaign_Back_Deeplink_${faker.lorem.word()}`,
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
          active: true,
          message: `Personal_Message_${faker.lorem.word()}`,
          admin: {
            job_title: null,
            name: 'Piotr',
            avatar_url:
              'https://pulsate-media-bucket-production.s3.eu-west-1.amazonaws.com/default-user-avatar.png',
            s_id: '667d59fe1d3766548f29ea63'
          }
        },
        image: {
          side: 'front',
          name: '1.jpeg',
          active: true,
          position: 0,
          url: 'https://pulsate-campaign-attachments-production.s3.eu-west-1.amazonaws.com/5fa13b64636f6e4be81b0000/2025-02-19/1739983889_1.jpeg'
        },
        headline: {
          side: 'front',
          active: true,
          text: `Headline_Front_${faker.lorem.word()}`,
          position: 1
        },
        text: {
          side: 'front',
          active: true,
          text: `Text_Front_${faker.lorem.word()}`,
          position: 2
        },
        call_to_action: {
          buttons: [
            {
              label: `Button_Card_Back_${faker.lorem.word()}`,
              destination_type: 'card_back',
              txt_color: '',
              btn_color: ''
            },
            {
              label: `Button_Deeplink_${faker.lorem.word()}`,
              destination_type: 'deeplink',
              destination: 'http://www.pulsatehq.com',
              txt_color: '',
              btn_color: ''
            }
          ],
          side: 'front'
        }
      },
      back_parts: {
        image: {
          name: '1.jpeg',
          active: true,
          position: 0,
          url: 'https://pulsate-campaign-attachments-production.s3.eu-west-1.amazonaws.com/5fa13b64636f6e4be81b0000/2025-02-19/1739983945_1.jpeg',
          side: 'back'
        },
        headline: {
          active: true,
          text: `Headline_Back_${faker.lorem.word()}`,
          position: 1,
          side: 'back'
        },
        text: {
          active: true,
          text: `Text_Back_${faker.lorem.word()}`,
          position: 2,
          side: 'back'
        },
        table: {
          active: true,
          position: 3,
          heading: `Table_Heading_${faker.lorem.word()}`,
          rows: [
            {
              value: `Value_${faker.lorem.word()}`,
              label: `Label_${faker.lorem.word()}`
            }
          ],
          side: 'back'
        },
        call_to_action: {
          active: true,
          buttons: [
            {
              label: `Button_Dismiss_${faker.lorem.word()}`,
              destination_type: 'dismiss',
              txt_color: '',
              btn_color: ''
            },
            {
              label: `Button_URL_${faker.lorem.word()}`,
              destination_type: 'url',
              destination: 'https://google.com',
              txt_color: '',
              btn_color: ''
            }
          ],
          side: 'back'
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
    campaign_expiry: true,
    expiry_time_frame: 'hours',
    expiry_time_value: 1
  };
