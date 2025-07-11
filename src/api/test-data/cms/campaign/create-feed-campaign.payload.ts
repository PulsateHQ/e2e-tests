import { CreateCampaignPayload } from '@_src/api/models/campaign.model';
import { faker } from '@faker-js/faker/locale/en';

export const createCampaignFeedOneButtonToUrl = (
  segmentIds: string[] = [],
  geofenceIds: string[] = [],
  geofence_events: Record<string, string> = {}
): CreateCampaignPayload => ({
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
  segment_ids: segmentIds,
  beacon_ids: [],
  geofence_ids: geofenceIds,
  in_app_event_names: [],
  beacon_events: {},
  geofence_events: geofence_events,
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
});

export const createCampaignFeedOneButtonWithDeeplink = (
  segmentIds: string[] = [],
  deeplink: string = ''
): CreateCampaignPayload => ({
  state_machine_notifications_state: 'initial',
  duplication_source_id: '',
  type: 'CardInboxCampaign',
  last_builder_page: '1',
  name: `Feed_Post_Campaign_Button_Deeplink_${faker.lorem.word()}`,
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
        name: '1.jpeg',
        active: true,
        position: 0,
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-05/1741185510_1.jpeg'
      },
      headline: {
        side: 'front',
        active: true,
        text: `Headline_Feed_Post_Campaigns_${faker.lorem.word()}`,
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
            label: `Button_Deeplink_${faker.lorem.word()}`,
            destination_type: 'deeplink',
            destination: deeplink,
            txt_color: '',
            btn_color: ''
          }
        ],
        side: 'front',
        active: true
      }
    },
    type: 'card',
    goals: []
  },
  segment_ids: segmentIds,
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
});

export const createCampaignFeedOneButtonBackWithDismiss = (
  segmentIds: string[] = []
): CreateCampaignPayload => ({
  state_machine_notifications_state: 'initial',
  duplication_source_id: '',
  type: 'CardInboxCampaign',
  last_builder_page: '1',
  name: `Feed_Post_Campaign_Back_Dismiss_${faker.lorem.word()}`,
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
        name: '1.jpeg',
        active: true,
        position: 0,
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-06/1741271162_1.jpeg'
      },
      headline: {
        side: 'front',
        active: true,
        text: `Headline_Feed_Post_Campaigns_${faker.lorem.word()}`,
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
            label: `Button_Card_Back_${faker.lorem.word()}`,
            destination_type: 'card_back',
            txt_color: '',
            btn_color: ''
          }
        ],
        side: 'front'
      }
    },
    back_parts: {
      image: {
        name: '2.jpeg',
        active: true,
        position: 0,
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-06/1741271193_2.jpeg',
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
            btn_color: '',
            in_app_events: null,
            order_number: 0
          }
        ],
        side: 'back'
      }
    },
    type: 'card',
    goals: []
  },
  segment_ids: segmentIds,
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
});

export const createCampaignFeedTwoButtonsWithBackAndDeeplink = (
  segmentIds: string[] = [],
  deeplink: string = ''
): CreateCampaignPayload => ({
  state_machine_notifications_state: 'initial',
  duplication_source_id: '',
  type: 'CardInboxCampaign',
  last_builder_page: '1',
  name: `Feed_Post_Campaign_Two_Buttons_${faker.lorem.word()}`,
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
        name: '1.jpeg',
        active: true,
        position: 0,
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-07/1741340304_1.jpeg'
      },
      headline: {
        side: 'front',
        active: true,
        text: `Headline_Feed_Post_Campaigns_${faker.lorem.word()}`,
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
          },
          {
            label: `Button_Card_Back_${faker.lorem.word()}`,
            destination_type: 'card_back',
            txt_color: '',
            btn_color: ''
          }
        ],
        side: 'front'
      }
    },
    back_parts: {
      image: {
        name: '2.jpeg',
        active: true,
        position: 0,
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-07/1741340342_2.jpeg',
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
        active: false,
        position: 3,
        heading: '',
        rows: [],
        side: 'back'
      },
      call_to_action: {
        active: true,
        buttons: [
          {
            label: `Button_Deeplink_${faker.lorem.word()}`,
            destination_type: 'deeplink',
            destination: deeplink,
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
  segment_ids: segmentIds,
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
});
