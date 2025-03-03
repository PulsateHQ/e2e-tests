export interface AppResponse {
  id: string;
  name: string;
}

export interface GetAllAppsParams {
  search_query?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: string;
  per_page?: string;
}

export interface GetAllAppsResponse {
  data: AppResponse[];
  metadata: {
    page: number;
    per_page: number;
    total_pages: number;
    data_count: number;
  };
}

export interface CreateAppRequest {
  'app[name]': string;
  'app[setting_attributes][mode]': 'production';
}

export interface DeleteAppRequest {
  name: string;
  password: string;
}

export interface SdkCredentialsResponse {
  app_id: string;
  app_key: string;
  access_token: string;
}
