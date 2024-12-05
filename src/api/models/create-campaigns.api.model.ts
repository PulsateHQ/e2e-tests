export interface CampaignGoal {
  primary: boolean;
  event_kind: string;
  event_identifier: string | null;
  expiry_time_unit: string;
  expiry_time_value: number;
}

export interface CampaignButton {
  label: string;
  destination_type: string;
  destination?: string;
  txt_color: string;
  btn_color: string;
}

export interface CampaignCallToAction {
  buttons: CampaignButton[];
  side: string;
}

export interface CampaignText {
  side: string;
  active: boolean;
  text: string;
  position: number;
}

export interface CampaignImage {
  side: string;
  name: string;
  active: boolean;
  position: number;
  url: string;
}

export interface CampaignHeadline {
  side: string;
  active: boolean;
  text: string;
  position: number;
}

export interface CampaignAdminHeaderWithMessage {
  side: string;
  position: number;
  active: boolean;
  message: string;
  admin: {
    job_title: string | null;
    name: string | null;
    avatar_url: string | null;
    s_id: string | null;
  };
}

export interface CampaignLargeNotification {
  admin_header_with_message: CampaignAdminHeaderWithMessage;
  image: CampaignImage;
  headline: CampaignHeadline;
  text: CampaignText;
  call_to_action: CampaignCallToAction;
}

export interface InAppNotification {
  large: CampaignLargeNotification;
}

export interface CardNotification {
  front_parts: {
    admin_header_with_message: CampaignAdminHeaderWithMessage;
    image: CampaignImage;
    headline: CampaignHeadline;
    text: CampaignText;
    call_to_action: CampaignCallToAction;
  };
  type: string;
  goals: CampaignGoal[];
}

export interface CreateCampaignPayload {
  state_machine_notifications_state: string;
  duplication_source_id: string;
  type: string;
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
  time_frame: string;
  time_value: string;
  time_zone_name: string;
  time_zone_offset: string;
  delivery: string;
  campaign_limits: boolean;
  campaign_expiry: boolean;
}
