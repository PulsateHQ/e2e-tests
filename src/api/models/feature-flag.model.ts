export interface FeatureFlagsRequest {
  feature_flags: FeatureFlag[];
}

export interface FeatureFlag {
  app_id: string;
  flags: Flags;
}

export interface Flags {
  auto_mark_messages_read: boolean;
  ff_admin_access_restrictions: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  ff_custom_tags_on_user_profile: boolean;
  ff_journeys: boolean;
  ff_cunexus: boolean;
  ff_push_send_to_url: boolean;
  ff_geofences: boolean;
  ff_beacons: boolean;
  ff_push_notifications_full_access: boolean;
  ff_external_goal_file_upload_section: boolean;
  ff_excluded_from_cron_jobs: boolean;
  ff_change_notification_button_colors: boolean;
  ff_branding: boolean;
  ff_notifications_extra_buttons_enabled: boolean;
  ff_q2_in_app: boolean;
  ff_campaigns_goals: boolean;
  ff_messages: boolean;
  ff_segment_delivery: boolean;
  ff_web_sdk: boolean;
  ff_csv_users_upload: boolean;
  sms_delivery: boolean;
  ff_push: boolean;
  ff_send_to_report_service: boolean;
  ff_send_to_user_service: boolean;
  ff_feed_post_plus_notification: boolean;
  ff_push_rich_media: boolean;
  ff_infra_report_service_read: boolean;
  ff_infra_report_service_send: boolean;
  ff_infra_user_service_send: boolean;
  ff_infra_user_service_read: boolean;
  ff_concat_custom_attributes: boolean;
  ff_core_member_id_upload: boolean;
  ff_restrict_badge_for_mobile_push: boolean;
  ff_demo_mode: boolean;
  ff_opportunities_dashboard: boolean;
  ff_opportunities_stats: boolean;
  ff_small_in_app: boolean;
}
