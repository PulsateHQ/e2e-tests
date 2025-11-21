import { registerCompany } from '@_src/api/factories/cms.admin.api.factory';
import {
  superAdminsActivationCodesCreate,
  superAdminsFeatureFLagDefaultBatchUpdate
} from '@_src/api/factories/cms.super-admin.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { generateCompanyPayload } from '@_src/api/test-data/cms/admins/company-registration.payload';
import { APIRequestContext } from '@playwright/test';

/**
 * Generates identifiable company and app names for E2E tests
 * Format: {prefix}-company-{timestamp} and {prefix}-app-{timestamp}
 * @param prefix - Optional prefix for company/app names (default: 'e2e-api-tests')
 */
function generateIdentifiableNames(prefix: string = 'e2e-api-tests'): {
  companyName: string;
  appName: string;
} {
  const timestamp = Date.now();
  return {
    companyName: `${prefix}-company-${timestamp}`,
    appName: `${prefix}-app-${timestamp}`
  };
}

/**
 * Internal helper to setup an isolated company with activation code and registration.
 * This is the shared core logic used by both public setup functions.
 * @param request - Playwright API request context
 * @param superAdminToken - Super admin access token
 * @param prefix - Prefix for company/app names
 * @param updateFeatureFlags - Whether to update feature flags after registration
 * @returns Promise resolving to APIE2ELoginUserModel with isolated credentials
 */
async function setupIsolatedCompanyInternal(
  request: APIRequestContext,
  superAdminToken: string,
  prefix: string,
  updateFeatureFlags: boolean
): Promise<APIE2ELoginUserModel> {
  // Create activation code
  const activationCodeResponse = await superAdminsActivationCodesCreate(
    request,
    superAdminToken
  );
  const activationCodeJson = await activationCodeResponse.json();
  const activationCode = activationCodeJson.activation_code;

  // Generate identifiable names
  const { companyName, appName } = generateIdentifiableNames(prefix);

  // Generate company payload with custom names - store to preserve password
  const registrationData = {
    ...generateCompanyPayload(activationCode),
    company_name: companyName,
    app_name: appName
  };

  // Register company using super admin token
  const companyRegistrationResponse = await registerCompany(
    request,
    superAdminToken,
    registrationData
  );
  const companyRegistrationResponseJson =
    await companyRegistrationResponse.json();

  const appId = companyRegistrationResponseJson.data.recent_mobile_app_id;
  const adminAccessToken =
    companyRegistrationResponseJson.data.admin_access_token;
  const username = companyRegistrationResponseJson.data.username;
  const email = companyRegistrationResponseJson.data.email;
  const companyAlias = companyRegistrationResponseJson.data._id.$oid;

  // Update feature flags if requested
  if (updateFeatureFlags) {
    await superAdminsFeatureFLagDefaultBatchUpdate(request, superAdminToken, [
      appId
    ]);
  }

  return {
    apiE2EAccessTokenAdmin: adminAccessToken,
    apiE2EAccessTokenSuperAdmin: superAdminToken,
    apiE2EAppId: appId,
    username: username,
    password: registrationData.password,
    email: email,
    companyAlias: companyAlias
  };
}

/**
 * Sets up an isolated company and app for parallel test execution.
 * Creates a new company with its own appId and admin access token,
 * ensuring test isolation between workers.
 * Returns all available credentials including UI-specific fields (username, password, email, companyAlias)
 * for both API and UI tests. UI-specific fields are optional and can be ignored by API tests.
 *
 * @param request - Playwright API request context
 * @param superAdminToken - Super admin access token for creating activation codes and updating feature flags
 * @returns Promise resolving to APIE2ELoginUserModel with isolated credentials including UI-specific fields
 */
export async function setupIsolatedCompany(
  request: APIRequestContext,
  superAdminToken: string
): Promise<APIE2ELoginUserModel> {
  return setupIsolatedCompanyInternal(
    request,
    superAdminToken,
    'e2e-sender-company',
    true
  );
}

/**
 * Sets up an isolated company and app for receiving notifications in UI tests.
 * Uses only super admin token for complete isolation, creating company from scratch.
 * Matches the pattern of setupIsolatedCompany - both use super admin token for registration.
 * Note: This function does NOT update feature flags - caller must do this separately if needed.
 *
 * @param request - Playwright API request context
 * @param superAdminToken - Super admin access token for creating activation codes and registering company
 * @returns Promise resolving to APIE2ELoginUserModel with isolated credentials including UI-specific fields
 */
export async function setupIsolatedCompanyForReceivingNotifications(
  request: APIRequestContext,
  superAdminToken: string
): Promise<APIE2ELoginUserModel> {
  return setupIsolatedCompanyInternal(
    request,
    superAdminToken,
    'e2e-receiver-company',
    false
  );
}
