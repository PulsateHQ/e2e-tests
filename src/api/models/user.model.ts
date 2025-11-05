export interface UserResponse {
  id: string;
  age: number | null;
  alias: string;
  created_at: string;
  current_city: string;
  current_country: string;
  current_location: string | null;
  custom_attrs: {
    gender: string;
  };
  custom_data: string[];
  device: Device;
  email: string;
  first_name: string;
  full_name: string;
  gender: string;
  in_app_events: unknown[];
  last_name: string;
  location_tracking_enabled: boolean;
  note: string;
  phone: string;
  opt_out_preferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  session: {
    first_at: string | null;
    last_at: string | null;
    created_count: number;
  };
  status: {
    active: boolean;
    deleted: boolean;
    uninstalled: boolean;
    unsubscribed: boolean;
  };
  updated_at: string;
  permissions: {
    destroy: boolean;
    subscribe: boolean;
    unsubscribe: boolean;
  };
}

export interface Device {
  active: boolean;
  uninstalled: boolean;
  guid: string | null;
  type: string;
  app_version: string;
  os_version: string;
  sdk_version: string;
  timezone: string | null;
  language: string;
  location_permission: string;
  push_permission: string;
}

export interface CustomTag {
  key: string;
  value: boolean | string;
  type: string;
  action: string;
}

export interface UserRequest {
  age: number;
  alias: string;
  current_city: string;
  current_country: string;
  current_location: [number, number];
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  phone: string;
  device: Device;
  custom_tags: CustomTag[];
}

export interface UserListResponse {
  data: UserResponse[];
  metadata: {
    page: number;
    per_page: number;
    total_pages: number;
    data_count: number;
  };
}

export interface GetAllUsersOptions {
  sort?: string;
  order?: string;
  page?: number;
  perPage?: number;
  appId?: string;
}
