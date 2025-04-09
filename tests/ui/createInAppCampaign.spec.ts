import { UI_E2E_APP_ID } from '@_config/env.config';
import { expect, test } from '@_src/ui/fixtures/merge.fixture';

test.describe('In-App Campaign Creation', () => {
  // Front-end access token for authentication
  const accessToken = '359d6e08c9c9c3678fe54706ce92ffb4c003';
  // App ID to use with this token
  const appId = UI_E2E_APP_ID;

  test.beforeEach(async ({ loginPage }) => {
    // Login with token before proceeding
    await loginPage.loginWithToken(accessToken, appId);
  });

  test('should create a new in-app full-screen campaign with URL button', async ({
    campaignsPage
  }) => {
    // Navigate to create a new campaign
    await campaignsPage.navigateToNewCampaign();

    // Select In-App campaign type
    await campaignsPage.selectInAppCampaignType();

    // Select Full-Screen layout
    await campaignsPage.selectFullScreenLayout();

    // Create campaign with required details
    const campaignName = `Test Campaign ${Date.now()}`;
    const buttonText = 'Shop Now';
    const buttonUrl = 'https://www.google.com';

    await campaignsPage.createInAppCampaign(
      campaignName,
      buttonText,
      buttonUrl
    );

    // Verify campaign setup progress
    await expect(campaignsPage.campaignNameInput).toHaveValue(campaignName);
    await expect(campaignsPage.buttonTextInput).toHaveValue(buttonText);
    await expect(campaignsPage.urlInput).toHaveValue(buttonUrl);
  });
});
