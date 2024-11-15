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
}

export interface StartMobileSessionPayload {
  alias: string;
  device: Device;
}
