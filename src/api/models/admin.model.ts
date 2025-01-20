export interface APIE2ELoginUserModel {
  apiE2EAccessTokenAdmin: string;
  apiE2EAccessTokenSuperAdmin?: string;
  apiE2EAppId: string;
}

export interface APIE2ETokenSDKModel {
  apiE2EAccessTokenSdk: string;
}

export interface CompanyRegistrationRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  activation_code: string;
  company_name: string;
  app_name: string;
  role: 'master_admin' | 'admin';
  generate_admin_token?: boolean;
}
