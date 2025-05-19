export interface E2EAdminLoginCredentialsModel {
  userEmail: string;
  userPassword: string;
  uiE2EAppId?: string;
}

export interface E2EAdminAuthDataModel {
  uiE2EAccessTokenAdmin: string;
  uiE2EAccessTokenSuperAdmin?: string;
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
