import { CreateCampaignPayload } from '@_src/api/models/create-campaigns.api.model';
import { faker } from '@faker-js/faker';

export const createCampaignPayload: CreateCampaignPayload = {
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
