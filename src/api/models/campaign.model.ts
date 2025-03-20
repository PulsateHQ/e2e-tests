export interface CampaignGoal {
  primary: boolean;
  event_kind: string;
  event_identifier: string | null;
  expiry_time_unit: 'hours' | 'days' | 'weeks';
  expiry_time_value: number;
}

export interface CampaignButton {
  label: string;
  destination_type:
    | 'card_back'
    | 'deeplink'
    | 'dismiss'
    | 'url'
    | 'openfeed'
    | 'card';
  destination?: string;
  txt_color: string;
  btn_color: string;
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
