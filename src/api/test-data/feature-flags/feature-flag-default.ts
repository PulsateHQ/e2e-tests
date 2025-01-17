import { FeatureFlagsRequest } from '@_src/api//models/feature-flag.api.model';

export const featureFlagsTestData: FeatureFlagsRequest = {
  feature_flags: [
    {
      app_id: '',
      flags: {
        auto_mark_messages_read: true,
        ff_admin_access_restrictions: false,
        sms_enabled: false,
        email_enabled: false,
        ff_custom_tags_on_user_profile: true,
        ff_journeys: true,
        ff_cunexus: false,
        ff_push_send_to_url: false,
        ff_geofences: true,
        ff_beacons: false,
        ff_push_notifications_full_access: true,
        ff_external_goal_file_upload_section: false,
        ff_excluded_from_cron_jobs: false,
        ff_change_notification_button_colors: true,
        ff_notifications_extra_buttons_enabled: true,
        ff_q2_in_app: false,
        ff_campaigns_goals: false,
        ff_messages: false,
        ff_segment_delivery: false,
        ff_web_sdk: false,
        ff_csv_users_upload: true,
        ff_pulsate_beta: true,
        ff_dashboard_beta: true,
        sms_delivery: false,
        ff_push: true,
        ff_send_to_report_service: false,
        ff_send_to_user_service: false,
        ff_feed_post_plus_notification: true,
        ff_push_rich_media: true,
        ff_infra_report_service_read: false,
        ff_infra_report_service_send: false,
        ff_infra_user_service_send: false,
        ff_infra_user_service_read: false,
        ff_concat_custom_attributes: false,
        ff_core_member_id_upload: false,
        ff_restrict_badge_for_mobile_push: false,
        ff_demo_mode: false,
        ff_old_app_and_device_stats: false,
        ff_opportunities_dashboard: false,
        ff_opportunities_stats: false,
        ff_small_in_app: true
      }
    }
  ]
};
