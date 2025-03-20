import { CreateCampaignPayload } from '@_src/api/models/campaign.model';
import { faker } from '@faker-js/faker/locale/en';

export const createCampaignInAppLargeButtonWithUrl: CreateCampaignPayload = {
  state_machine_notifications_state: 'initial',
  duplication_source_id: '',
  type: 'InAppNotificationCampaign',
  last_builder_page: '1',
  name: `InApp_Large_Campaign_Button_URL_${faker.lorem.word()}`,
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
        name: '1.jpeg',
        active: false,
        position: 0,
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-05/1741185510_1.jpeg'
      },
      headline: {
        side: 'front',
        active: true,
        text: `Headline_InApp_Large_Campaign_Button_URL_${faker.lorem.word()}`,
        position: 1
      },
      text: {
        side: 'front',
        active: true,
        text: `Text_InApp_Large_Campaign_Button_URL_${faker.lorem.word()}`,
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

export const createCampaignInAppLargeButtonWithDeeplink: CreateCampaignPayload =
  {
    state_machine_notifications_state: 'initial',
    duplication_source_id: '',
    type: 'InAppNotificationCampaign',
    last_builder_page: '1',
    name: `InApp_Large_Campaign_Button_Deeplink_${faker.lorem.word()}`,
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
          name: '1.jpeg',
          active: false,
          position: 0,
          url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-05/1741185510_1.jpeg'
        },
        headline: {
          side: 'front',
          active: true,
          text: `Headline_InApp_Large_Campaign_Button_Deeplink_${faker.lorem.word()}`,
          position: 1
        },
        text: {
          side: 'front',
          active: true,
          text: `Text_InApp_Large_Campaign_Button_Deeplink_${faker.lorem.word()}`,
          position: 2
        },
        call_to_action: {
          buttons: [
            {
              label: `Button_Deeplink_${faker.lorem.word()}`,
              destination_type: 'deeplink',
              destination: '',
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

export const createCampaignInAppLargeButtonWithDismiss: CreateCampaignPayload =
  {
    state_machine_notifications_state: 'initial',
    duplication_source_id: '',
    type: 'InAppNotificationCampaign',
    last_builder_page: '1',
    name: `InApp_Large_Campaign_Button_Dismiss_${faker.lorem.word()}`,
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
          name: '1.jpeg',
          active: false,
          position: 0,
          url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-05/1741185510_1.jpeg'
        },
        headline: {
          side: 'front',
          active: true,
          text: `Headline_InApp_Large_Campaign_Button_Dismiss_${faker.lorem.word()}`,
          position: 1
        },
        text: {
          side: 'front',
          active: true,
          text: `Text_InApp_Large_Campaign_Button_Dismiss_${faker.lorem.word()}`,
          position: 2
        },
        call_to_action: {
          buttons: [
            {
              label: `Button_Dismiss_${faker.lorem.word()}`,
              destination_type: 'dismiss',
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

export const createCampaignInAppLargeWithTwoButtons: CreateCampaignPayload = {
  state_machine_notifications_state: 'initial',
  duplication_source_id: '',
  type: 'InAppNotificationCampaign',
  last_builder_page: '1',
  name: `InApp_Large_Two_Buttons_${faker.lorem.word()}`,
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
        name: '2.jpeg',
        active: true,
        position: 0,
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-17/1742228168_2.jpeg'
      },
      headline: {
        side: 'front',
        active: true,
        text: `Headline_InApp_Large_Campaign_Two_Buttons_${faker.lorem.word()}`,
        position: 1
      },
      text: {
        side: 'front',
        active: true,
        text: `Text_InApp_Large_Campaign_Two_Buttons_${faker.lorem.word()}`,
        position: 2
      },
      call_to_action: {
        buttons: [
          {
            label: `Deeplink_Button_${faker.lorem.word()}`,
            destination_type: 'deeplink',
            destination: '',
            txt_color: '',
            btn_color: ''
          },
          {
            label: `Dismiss_Button_${faker.lorem.word()}`,
            destination_type: 'dismiss',
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
  time_frame: 'days',
  time_value: '1',
  time_zone_name: 'Europe/Warsaw',
  time_zone_offset: '+01:00',
  delivery: 'current_future',
  campaign_limits: true,
  campaign_expiry: false
};

export const createCampaignInAppSmallTopWithUrl: CreateCampaignPayload = {
  state_machine_notifications_state: 'initial',
  duplication_source_id: '',
  type: 'InAppNotificationCampaign',
  last_builder_page: '1',
  name: `InApp_Small_Top_Button_URL_${faker.lorem.word()}`,
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
    small: {
      type: 'corporate',
      position: 'top',
      call_to_action: {
        buttons: [
          {
            label: `URL_Button_${faker.lorem.word()}`,
            destination_type: 'url',
            destination: 'https://google.com',
            txt_color: '',
            btn_color: ''
          }
        ]
      },
      image_header_with_message: {
        name: '1.jpeg',
        url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-20/1742462955_1.jpeg',
        message: `Small_Banner_Text_${faker.lorem.sentence(3)}`
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

export const createCampaignInAppSmallBottomWithDeeplink: CreateCampaignPayload =
  {
    state_machine_notifications_state: 'initial',
    duplication_source_id: '',
    type: 'InAppNotificationCampaign',
    last_builder_page: '1',
    name: `InApp_Small_Bottom_Button_Deeplink_${faker.lorem.word()}`,
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
      small: {
        type: 'corporate',
        position: 'bottom',
        call_to_action: {
          buttons: [
            {
              label: `Deeplink_Button_${faker.lorem.word()}`,
              destination_type: 'deeplink',
              destination: '',
              txt_color: '',
              btn_color: ''
            }
          ]
        },
        image_header_with_message: {
          name: '1.jpg',
          url: 'https://pulsate-campaign-attachments.s3.eu-west-1.amazonaws.com/643e3df7b58b2c3a5e6bd605/2025-03-05/1741185510_1.jpeg',
          message: `Small_Banner_Bottom_Text_${faker.lorem.sentence(3)}`
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
