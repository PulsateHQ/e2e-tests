import { registerCompany } from '@_src/api/factories/admin.api.factory';
import {
  superAdminsActivationCodesCreate,
  superAdminsFeatureFLagDefaultBatchUpdate
} from '@_src/api/factories/super.admin.api.factory';
import { APIE2ELoginUserModel } from '@_src/api/models/admin.model';
import { generateCompanyPayload } from '@_src/api/test-data/cms/admins/company-registration.payload';
import { APIRequestContext } from '@playwright/test';

/**
 * Generates identifiable company and app names for E2E tests
 * Format: e2e-api-tests-{type}-{timestamp}
 */
function generateIdentifiableNames(): {
  companyName: string;
  appName: string;
} {
  const timestamp = Date.now();
  return {
    companyName: `e2e-api-tests-company-${timestamp}`,
    appName: `e2e-api-tests-app-${timestamp}`
  };
}

/**
 * Sets up an isolated company and app for parallel test execution.
 * Creates a new company with its own appId and admin access token,
 * ensuring test isolation between workers.
 *
 * @param request - Playwright API request context
 * @param superAdminToken - Super admin access token for creating activation codes and updating feature flags
 * @param adminToken - Admin access token for registering the company
 * @returns Promise resolving to APIE2ELoginUserModel with isolated credentials
 */
export async function setupIsolatedCompany(
  request: APIRequestContext,
  superAdminToken: string,
  adminToken: string
): Promise<APIE2ELoginUserModel> {
  // Create activation code
  const activationCodeResponse = await superAdminsActivationCodesCreate(
    request,
    superAdminToken
  );
  const activationCodeJson = await activationCodeResponse.json();
  const activationCode = activationCodeJson.activation_code;

  // Generate identifiable names
  const { companyName, appName } = generateIdentifiableNames();

  // Generate company payload with custom names
  const registrationData = {
    ...generateCompanyPayload(activationCode),
    company_name: companyName,
    app_name: appName
  };

  // Register company
  const companyRegistrationResponse = await registerCompany(
    request,
    adminToken,
    registrationData
  );
  const companyRegistrationResponseJson =
    await companyRegistrationResponse.json();

  const appId = companyRegistrationResponseJson.data.recent_mobile_app_id;
  const adminAccessToken =
    companyRegistrationResponseJson.data.admin_access_token;

  // Update feature flags for the new app
  await superAdminsFeatureFLagDefaultBatchUpdate(request, superAdminToken, [
    appId
  ]);

  return {
    apiE2EAccessTokenAdmin: adminAccessToken,
    apiE2EAccessTokenSuperAdmin: superAdminToken,
    apiE2EAppId: appId
  };
}
