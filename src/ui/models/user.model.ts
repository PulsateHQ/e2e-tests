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
