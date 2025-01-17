export interface UIIntegrationLoginUserModel {
  userEmail: string;
  userPassword: string;
}

export interface CompanyRegistrationModel {
  fullName: string;
  username: string;
  invalidEmail: string;
  validEmail: string;
  shortPassword: string;
  validPassword: string;
  passwordConfirmation: string;
  companyName: string;
  appName: string;
  activationCode: string;
}

export interface APIE2ELoginUserModel {
  apiE2EAccessTokenAdmin: string;
  apiE2EAccessTokenSuperAdmin?: string;
  apiE2EAppId: string;
}

export interface APIE2ETokenSDKModel {
  apiE2EAccessTokenSdk: string;
}
