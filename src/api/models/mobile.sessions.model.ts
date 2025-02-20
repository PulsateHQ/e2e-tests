export interface Device {
  type: string;
  token: string;
  bluetooth_state: string;
  os_version: string;
  sdk_version: string;
  app_version: string;
  language: string;
  location_permission: string;
  push_permission: string;
  background_location_permission: string;
  in_app_permission: string;
  timezone: string;
}

export interface StartMobileSessionPayload {
  alias: string;
  device: Device;
  current_location?: number[];
  guid?: string;
  occurred_at?: number;
  localization_data?: string;
}
