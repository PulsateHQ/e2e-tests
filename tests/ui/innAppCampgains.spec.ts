import {
  ADMIN_ACCESS_TOKEN,
  USER_LOGIN_ADMIN,
  USER_LOGIN_RECEIVER_IN_APP,
  USER_PASSWORD_ADMIN,
  USER_PASSWORD_RECEIVER_IN_APP
} from '@_config/env.config';
import { expect, test } from '@playwright/test';

test.describe('InApp Campaigns', () => {
  test('login to WEB SDK app and create InApp Campaigns', async ({
    page,
    request
  }) => {
    await page.goto('/');

    await page
      .getByRole('textbox', {
        name: 'Username or Email'
      })
      .fill(`${USER_LOGIN_ADMIN}`);

    await page
      .getByRole('textbox', {
        name: 'Password Forgot your password?'
      })
      .fill(`${USER_PASSWORD_ADMIN}`);

    await page
      .getByRole('button', {
        name: 'Sign in'
      })
      .click();

    await expect(page.getByText('WEB SDK POC')).toHaveText('WEB SDK POC');

    await page
      .locator('nav')
      .filter({
        hasText: 'WEB SDK POCAccount'
      })
      .getByRole('button')
      .click();

    await page.getByText(' Targeting').click();
    await page
      .getByRole('link', {
        name: '- Segments'
      })
      .click();

    // Arrange
    const expectedStatusCode = 200;

    // Wait for the network request to complete
    const response = await page.waitForResponse(
      (response) =>
        response
          .url()
          .includes('/api/v2/apps/643e3df7b58b2c3a5e6bd605/segments') &&
        response.status() === expectedStatusCode
    );
    const responseData = await response.json();
    const segmentIds = responseData.data.map(
      (segment: { id: string }) => segment.id
    );

    // Act
    const responseDelete = await request.delete(
      'https://controltiger.furiousapi.com/api/v2/apps/643e3df7b58b2c3a5e6bd605/segments/batch_destroy',
      {
        headers: {
          Authorization: `Token token=${ADMIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: {
          resource_ids: segmentIds
        }
      }
    );

    // Assert
    const actualResponseStatus = responseDelete.status();
    expect(
      actualResponseStatus,
      `expected status code ${expectedStatusCode}, and received ${actualResponseStatus}`
    ).toBe(expectedStatusCode);

    // Assert check deleted segments
    for (const segmentId of segmentIds) {
      const responseGet = await request.get(
        `https://controltiger.furiousapi.com/api/v2/apps/643e3df7b58b2c3a5e6bd605/segments/${segmentId}`,
        {
          headers: {
            Authorization: `Token token=${process.env.ADMIN_ACCESS_TOKEN_TIGER}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const expectedDeletedSegmentStatusCode = 404;
      expect(
        responseGet.status(),
        `expected status code ${expectedDeletedSegmentStatusCode}, and received ${responseGet.status()}`
      ).toBe(expectedDeletedSegmentStatusCode);
    }

    await page
      .getByRole('link', {
        name: 'New Segment'
      })
      .click();
    await page
      .getByRole('button', {
        name: 'Add condition'
      })
      .click();
    await page
      .getByRole('button', {
        name: 'Personal'
      })
      .click();
    await page
      .getByRole('menuitem', {
        name: 'Alias'
      })
      .click();
    await page.locator('input.form-control').fill('66f3c08fb58b2ca11eea1a4d');
    await page
      .getByRole('button', {
        name: 'Estimate segment'
      })
      .click();
    await expect(
      page.getByText('1 of 29 users match this criteria')
    ).toBeVisible();
    await page
      .getByRole('button', {
        name: 'Save Segment'
      })
      .click();
    await page
      .getByRole('textbox', {
        name: 'Segment name'
      })
      .fill('Playwright Segment');
    await page
      .getByRole('button', {
        name: 'Save',
        exact: true
      })
      .click();

    await expect(
      page.getByRole('link', {
        name: 'Playwright Segment'
      })
    ).toBeVisible();

    await page.getByText('Campaigns').click();
    await page.getByTestId('duplicateCampaignBtn').first().click();

    // await page.getByRole("link", {name: "New Campaign"}).click()
    // await page.getByTestId("in_app").click()
    // await page.getByText("Full-Screen").click()

    // await page.getByRole("textbox", {name: "Campaign Name"}).fill("Playwright Campaign")
    // await page.getByRole("button", {name: "Save & Continue"}).click()
    //
    // await page.locator('.react-switch-bg').first().click();
    // await page.locator('div:nth-child(3) > .react-switch > .react-switch-bg').first().click();
    // await page.locator('div:nth-child(2) > div > .d-flex > .react-switch > .react-switch-bg').click();
    // await page.getByText("Text", { exact: true }).click();
    // await page.getByRole('button', { name: 'Insert' }).click();
    // await page.locator('#react-select-12-option-0').first().click();
    // // await page.locator('#react-select-7-option-0').getByText('first_name').click();
    //
    // await page.getByText('Call to Action').click();
    // await page.getByPlaceholder('Button Text').fill('Dismiss');
    // await page.getByRole('button', { name: 'Dismiss' }).click();
    await page
      .getByRole('button', {
        name: 'Save & Continue'
      })
      .click();
    await page
      .getByRole('button', {
        name: 'Save & Continue'
      })
      .click();

    await page
      .getByText('segments', {
        exact: true
      })
      .click();
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (
      !(await page
        .getByRole('row', {
          name: 'Playwright Segment'
        })
        .locator('input[type="checkbox"]')
        .isChecked())
    ) {
      await page
        .getByRole('row', {
          name: 'Playwright Segment'
        })
        .locator('button')
        .click();
    }
    await page
      .getByRole('button', {
        name: 'Save & Continue'
      })
      .click();

    await page
      .getByRole('button', {
        name: 'Select'
      })
      .first()
      .click();

    await page
      .getByText('Immediately', {
        exact: true
      })
      .click();
    await page
      .getByText('Never', {
        exact: true
      })
      .click();
    await page
      .getByRole('button', {
        name: 'Save & Continue'
      })
      .click();

    await page
      .getByRole('button', {
        name: 'Send Campaign'
      })
      .click();
    await page
      .getByRole('dialog')
      .getByRole('button', {
        name: 'Send Campaign'
      })
      .click();

    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Scheduled')).toBeHidden();

    await page.locator('li.ms-1.dropdown.nav-item').click();
    await page
      .getByRole('menuitem', {
        name: 'Sign out'
      })
      .click();

    await expect(
      page.getByRole('button', {
        name: 'Sign in'
      })
    ).toBeVisible();

    await page
      .getByRole('textbox', {
        name: 'Username or Email'
      })
      .fill(`${USER_LOGIN_RECEIVER_IN_APP}`);
    await page
      .getByRole('textbox', {
        name: 'Password Forgot your password?'
      })
      .fill(`${USER_PASSWORD_RECEIVER_IN_APP}`);
    await page
      .getByRole('button', {
        name: 'Sign in'
      })
      .click();

    await expect(page.getByText('Playwright campgain')).toHaveText(
      'Playwright campgain',
      {
        timeout: 20000
      }
    );
    await expect(
      page.getByRole('button', {
        name: 'Dismiss'
      })
    ).toHaveText('Dismiss', {
      timeout: 20000
    });
    await page
      .getByRole('button', {
        name: 'Dismiss'
      })
      .click();
    await expect(
      page.getByRole('button', {
        name: 'Dismiss'
      })
    ).toBeHidden();
  });
});
