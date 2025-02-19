export interface APIE2ELoginUserModel {
  apiE2EAccessTokenAdmin: string;
  apiE2EAccessTokenSuperAdmin?: string;
  apiE2EAppId: string;
}

export interface APIE2ETokenSDKModel {
  apiE2EAccessTokenSdk: string;
}

export interface CompanyAdminRegistrationRequest {
  name: string;
  email?: string;
  username: string;
  password: string;
  password_confirmation: string;
  activation_code?: string;
  company_name?: string;
  app_name?: string;
  role?: 'master_admin';
  generate_admin_token?: boolean;
  invite_token?: string;
}

export interface CompanyAdminRegistrationResponse {
  data: {
    _id: {
      $oid: string;
    };
    admin_access_token: string;
    avatar_s3_url: string | null;
    company_ids: Array<{
      $oid: string;
    }>;
    created_at: string;
    email: string;
    front_end_access_token: string;
    hidden: boolean;
    hidden_at: string | null;
    invite_token: string | null;
    job_title: string | null;
    name: string;
    provider: string;
    recent_mobile_app_id: string;
    role: 'master_admin';
    secret: string | null;
    secret_seen: boolean;
    super_admin_access_token: string | null;
    updated_at: string;
    username: string;
  };
  path: string;
}

export interface AdminListItem {
  id: string;
  access: string;
  actions: {
    edit: boolean;
    delete: boolean;
  };
  avatar_url: string;
  email: string;
  job_title: string | null;
  managed_app: {
    name: string | null;
    id: string;
  };
  name: string;
  role: 'master_admin' | 'admin';
  username: string;
  updated_at: string;
  created_at: string;
}

export interface AdminListResponse {
  data: AdminListItem[];
  metadata: {
    page: number;
    per_page: number;
    total_pages: number;
    data_count: number;
  };
}

export interface AdminDetailResponse {
  id: string;
  access: string;
  actions: {
    edit: boolean;
    delete: boolean;
  };
  avatar_url: string;
  email: string;
  job_title: string | null;
  managed_app: {
    name: string | null;
    id: string;
  };
  name: string;
  role: 'master_admin' | 'admin';
  username: string;
  updated_at: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
}

interface CurrentApp {
  id: string;
  type: string;
}

interface CurrentAdmin {
  admin_access_token: string;
  company_ids: string[];
  created_at: string;
  email: string;
  front_end_access_token: string;
  hidden: boolean;
  hidden_at: string | null;
  invite_token: string | null;
  job_title: string | null;
  name: string;
  provider: string;
  recent_mobile_app_id: string;
  role: 'master_admin' | 'admin';
  updated_at: string;
  username: string;
  id: string;
  avatar_url: string | null;
  is_default_avatar: boolean;
  master_admin: boolean;
}

export interface CurrentAdminResponse {
  admin: CurrentAdmin;
  companies: Company[];
  current_app: CurrentApp;
  info: string;
  unlayer_access_key: string;
  google_api_key: string;
  path: string;
}

export interface WhoAmIResponse {
  success: boolean;
}

export interface CreateAppRequest {
  'app[name]': string;
  'app[setting_attributes][mode]': 'production';
}

export interface DeleteAppRequest {
  name: string;
  password: string;
}

export interface AppResponse {
  id: string;
  name: string;
}

export interface UpdateAdminPrivilegesRequest {
  email: string;
  allowed_actions: string;
  role: string;
  managed_app_id?: string;
}

export interface UpdateAdminPrivilegesResponse {
  message: string;
  admin: {
    id: string;
    access: string;
    actions: {
      edit: boolean;
      delete: boolean;
    };
    avatar_url: string;
    email: string;
    job_title: string | null;
    managed_app: {
      name: string | null;
      id: string;
    };
    name: string;
    role: string;
    username: string;
    updated_at: string;
    created_at: string;
  };
}
