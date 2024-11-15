export interface Device {
  email: string;
  phone: string;
  type: string;
  language: string;
  token: string;
  os_version: string;
  sdk_version: string;
  app_version: string;
  timezone: string;
  push_permission: boolean;
  location_permission: boolean;
  background_location_permission: boolean;
}

export interface User {
  age: string;
  device: Device;
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  phone: string;
}

export interface UserAction {
  guid: string;
  key: string;
  occurred_at_array: string[];
  type: string;
}

export interface UpdateMobileUserPayload {
  alias: string;
  current_location: number[];
  custom_tags: never[];
  occurred_at: number;
  screen_records: never[];
  user: User;
  user_actions: UserAction[];
}
