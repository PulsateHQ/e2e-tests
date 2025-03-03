export interface Device {
  type: string;
  token: string;
  bluetooth_state: string;
  os_version: string;
  sdk_version: string;
  app_version: string;
  language: string;
  push_permission: boolean;
  location_permission: boolean;
  background_location_permission: boolean;
  in_app_permission: boolean;
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
