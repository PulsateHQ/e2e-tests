export interface CampaignGoal {
  primary: boolean;
  event_kind: string;
  event_identifier: string | null;
  expiry_time_unit: 'hours' | 'days' | 'weeks';
  expiry_time_value: number;
}

export interface CampaignButton {
  btn_color: string;
  destination_type:
    | 'card_back'
    | 'deeplink'
    | 'dismiss'
    | 'url'
    | 'openfeed'
    | 'card';
  destination?: string;
  label?: string;
  txt_color?: string;
  in_app_events?: null | Array<{
    name: string;
    count: number;
  }>;
  order_number?: number;
}

export interface CampaignCallToAction {
  buttons: CampaignButton[];
  side: 'front' | 'back';
  active?: boolean;
}

export interface CampaignBasePart {
  active: boolean;
  position: number;
  side: 'front' | 'back';
}

export interface CampaignText extends CampaignBasePart {
  text: string;
}

export interface CampaignImage extends CampaignBasePart {
  name: string;
  url: string;
}

export interface CampaignHeadline extends CampaignBasePart {
  text: string;
}

export interface CampaignTable extends CampaignBasePart {
  heading: string;
  rows: Array<{
    value: string;
    label: string;
  }>;
}

export interface CampaignAdminHeader {
  active: boolean;
  admin: null | string;
  message: null | string;
  position: number;
}

export interface CampaignInAppNotification {
  large: {
    call_to_action: CampaignCallToAction;
    admin_header_with_message: CampaignAdminHeader;
    position: string;
    headline: {
      active: boolean;
      position: number;
      text: string;
    };
    image: {
      active: boolean;
      name: null | string;
      position: number;
      url: null | string;
    };
    text: {
      active: boolean;
      position: number;
      text: string;
    };
  };
}

export interface CampaignAdminHeaderWithMessage {
  side: 'front';
  position: number;
  active: boolean;
  message: string;
  admin: {
    job_title: string | null;
    name: string;
    avatar_url: string;
    s_id: string;
  };
}

export interface CampaignLargeNotification {
  admin_header_with_message: CampaignAdminHeaderWithMessage;
  image: CampaignImage;
  headline: CampaignHeadline;
  text: CampaignText;
  call_to_action: CampaignCallToAction;
}

export interface CampaignSmallNotification {
  type: 'corporate' | string;
  position: 'top' | 'bottom';
  call_to_action: {
    buttons: CampaignButton[];
  };
  image_header_with_message: {
    name: string;
    url: string;
    message: string;
  };
}

export interface InAppNotification {
  large?: CampaignLargeNotification;
  small?: CampaignSmallNotification;
}

export interface CardNotification {
  front_parts: {
    admin_header_with_message: CampaignAdminHeaderWithMessage;
    image: CampaignImage;
    headline: CampaignHeadline;
    text: CampaignText;
    call_to_action: CampaignCallToAction;
  };
  back_parts?: {
    image: CampaignImage;
    headline: CampaignHeadline;
    text: CampaignText;
    table: CampaignTable;
    call_to_action: CampaignCallToAction;
  };
  type: 'card';
  goals: CampaignGoal[];
}

export interface CreateCampaignPayload {
  state_machine_notifications_state: 'initial' | string;
  duplication_source_id: string;
  type: 'CardInboxCampaign' | string;
  last_builder_page: string;
  name: string;
  control_group: null;
  goals: CampaignGoal[];
  in_app_notification?: InAppNotification;
  card_notification?: CardNotification;
  segment_ids: string[];
  beacon_ids: string[];
  geofence_ids: string[];
  in_app_event_names: string[];
  beacon_events: Record<string, unknown>;
  geofence_events: Record<string, unknown>;
  geofence_dwelling_times: Record<string, unknown>;
  start_now: boolean;
  start_at: string;
  end_at: string;
  time_frame: 'hours' | 'days' | 'weeks';
  time_value: string;
  time_zone_name: string;
  time_zone_offset: string;
  delivery: 'current' | string;
  campaign_limits: boolean;
  campaign_expiry: boolean;
  expiry_time_frame?: 'hours' | 'days' | 'weeks';
  expiry_time_value?: number;
}

export interface CampaignTarget {
  events: {
    details: Array<{
      name: string;
      count: number;
    }>;
    count: number;
  };
  geofences: {
    details: string[];
    count: number;
  };
  segments: {
    details: Array<{
      name: string;
      count: number;
    }>;
    count: number;
  };
  beacons: {
    details: Array<{
      name: string;
      count: number;
    }>;
    count: number;
  };
}

export interface CampaignDetailsResponse {
  id: string;
  name: string;
  author_name: string;
  allow_reply: boolean;
  broadcast_type: string;
  beacon_events: Record<string, string> | null;
  beacon_ids: string[];
  beacon_dwelling_times: Record<string, number> | null;
  campaign_expiry: boolean;
  campaign_limits: boolean;
  card_notification: CardNotification | null;
  control_group: null | {
    id: string;
    name: string;
  };
  created_at: string;
  delivered_at: null | string;
  delivery: string;
  display_type: string;
  dispatch_rate: number;
  duplication_source_id: string;
  email_notification: null | {
    subject: string;
    body: string;
  };
  end_at: null | string;
  expiry_date: null | string;
  expiry_time_frame: string;
  expiry_time_value: null | number;
  geofence_events: Record<string, string>;
  geofence_ids: string[];
  geofence_dwelling_times: Record<string, number> | null;
  goals_attributes: CampaignGoal[];
  group_ids: string[];
  guid: string;
  hidable: boolean;
  hidden: boolean;
  hidden_at: null | string;
  hidden_from_feed: boolean;
  in_app_event_names: string[];
  in_app_notification: InAppNotification;
  last_builder_page: string;
  push_variants: null | Array<{
    id: string;
    name: string;
    content: string;
  }>;
  segment_ids: string[];
  sms_notification: null | {
    content: string;
    sender: string;
  };
  start_at: string;
  start_now: boolean;
  status: string;
  target: CampaignTarget;
  time_frame: null | string;
  time_value: null | number;
  time_zone_name: string;
  time_zone_offset: string;
  time_windows: Array<{
    start: string;
    end: string;
    days: string[];
  }>;
  type: string;
  type_list: string[];
  updated_at: string;
}

export interface CardStatsValidationOptions {
  cardButtonClick?: number;
  frontImpression?: number;
  frontButtonClickOne?: number;
}

export interface BackCardStatsValidationOptions {
  backButtonClicksOne?: number;
  backButtonClicksTwo?: number;
  frontImpression?: number;
  frontButtonClickOne?: number;
  frontButtonClickTwo?: number;
}
