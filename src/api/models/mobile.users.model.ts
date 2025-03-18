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
  in_app_permission?: boolean;
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

export interface UpdateMobileUserPayload {
  alias: string;
  current_location: number[];
  custom_tags: never[];
  occurred_at: number;
  screen_records: never[];
  user: User;
  user_actions: UserAction[];
}
export interface UserAction {
  guid: string;
  key: InAppEvents;
  occurred_at_array: string[];
  type: string;
}

export enum InAppEvents {
  IN_APP_DELIVERY = 'in_app_delivery',
  IN_APP_IMPRESSION = 'in_app_impression',
  IN_APP_DISMISS = 'in_app_dismiss',
  IN_APP_BUTTON_CLICK_ONE = 'in_app_button_click_one',
  IN_APP_BUTTON_CLICK_TWO = 'in_app_button_click_two'
}
