import { CreateCampaignPayload } from '@_src/api/models/campaign.model';
import { faker } from '@faker-js/faker/locale/en';

export const createCampaignSmallInAppWithCard: CreateCampaignPayload = {
  state_machine_notifications_state: 'initial',
  duplication_source_id: '',
  type: 'CardInAppNotificationCampaign',
  last_builder_page: '1',
  name: `SmallInApp_With_Card_${faker.lorem.word()}`,
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
        name: '2.jpg',
        active: true,
        position: 0,
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/672cc2aab58b2cc1937b68b6/2025-03-20/1742488249_2.jpg'
      },
      headline: {
        side: 'front',
        active: true,
        text: `Headline_Card_${faker.lorem.words(3)}`,
        position: 1
      },
      text: {
        side: 'front',
        active: true,
        text: `<p>Text_Card_${faker.lorem.paragraph(1)}</p>`,
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
  in_app_notification: {
    small: {
      type: 'corporate',
      position: 'bottom',
      call_to_action: {
        buttons: [
          {
            label: `View_Card_${faker.lorem.word()}`,
            destination_type: 'card',
            txt_color: '',
            btn_color: ''
          }
        ]
      },
      image_header_with_message: {
        name: '1.jpeg',
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/672cc2aab58b2cc1937b68b6/2025-03-20/1742488210_1.jpeg',
        message: `Small_Banner_Text_${faker.lorem.sentence(1)}`
      }
    }
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

export const createCampaignLargeInAppWithFeedCardFrontBack: CreateCampaignPayload =
  {
    state_machine_notifications_state: 'initial',
    duplication_source_id: '',
    type: 'CardInAppNotificationCampaign',
    last_builder_page: '1',
    name: `LargeInApp_With_FeedCard_FrontBack_${faker.lorem.word()}`,
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
          url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-20/1742488910_1.jpeg'
        },
        headline: {
          side: 'front',
          active: true,
          text: `Headline_FeedCard_Front_${faker.lorem.words(3)}`,
          position: 1
        },
        text: {
          side: 'front',
          active: true,
          text: `<p>Text_FeedCard_Front_${faker.lorem.paragraph(1)}</p>`,
          position: 2
        },
        call_to_action: {
          buttons: [
            {
              label: `Button_FeedPostBack_${faker.lorem.word()}`,
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
          name: '',
          active: false,
          position: 0,
          url: '',
          side: 'back'
        },
        headline: {
          active: true,
          text: `Headline_FeedCard_Back_${faker.lorem.words(3)}`,
          position: 1,
          side: 'back'
        },
        text: {
          active: true,
          text: `<p>Text_FeedCard_Back_${faker.lorem.paragraph(1)}</p>`,
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
              destination: '',
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
          name: '2.jpeg',
          active: true,
          position: 0,
          url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-20/1742488838_2.jpeg'
        },
        headline: {
          side: 'front',
          active: true,
          text: `Headline_LargeInApp_${faker.lorem.words(3)}`,
          position: 1
        },
        text: {
          side: 'front',
          active: true,
          text: `<p>Text_LargeInApp_${faker.lorem.paragraph(1)}</p>`,
          position: 2
        },
        call_to_action: {
          buttons: [
            {
              label: `Button_OpenFeedPost_${faker.lorem.word()}`,
              destination_type: 'card',
              txt_color: '',
              btn_color: ''
            }
          ],
          side: 'front'
        }
      }
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
