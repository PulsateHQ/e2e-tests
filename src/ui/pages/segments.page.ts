import { UI_E2E_APP_ID } from '@_config/env.config';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BasePage } from '@_src/ui/pages/base.page';
import { Locator, Page, expect } from '@playwright/test';

export class SegmentsPage extends BasePage {
  url = `/mobile/apps/${UI_E2E_APP_ID}/segments`;
  sideBar: SideBarComponent;

  // =========================================================================
  // Locators
  // =========================================================================
  newSegmentButton: Locator = this.page.getByRole('link', {
    name: 'New Segment Button'
  });
  addConditionButton: Locator = this.page.getByRole('button', {
    name: 'Add condition'
  });
  personalConditionCategoryButton: Locator = this.page.getByRole('button', {
    name: 'Personal'
  });
  aliasConditionMenuItem: Locator = this.page.getByRole('menuitem', {
    name: 'Alias'
  });
  aliasMatchValueInput: Locator = this.page.getByRole('textbox', {
    name: 'Match Value'
  });
  saveSegmentButton: Locator = this.page.getByRole('button', {
    name: 'Save Segment Button'
  });
  segmentNameInput: Locator = this.page.getByRole('textbox', {
    name: 'Segment Name Input'
  });
  finalSaveButton: Locator = this.page.getByRole('button', {
    name: 'Save',
    exact: true
  });

  // =========================================================================
  // Constructor
  // =========================================================================
  constructor(page: Page) {
    super(page);
    this.sideBar = new SideBarComponent(page);
  }

  // =========================================================================
  // Navigation Methods (Existing)
  // =========================================================================
  async clickSidebarCategoryTargeting(): Promise<void> {
    await this.sideBar.clickSidebarCategoryTargeting();
  }

  async clickSidebarItemSegments(): Promise<void> {
    await this.sideBar.clickSidebarItemSegments();
  }

  // =========================================================================
  // Segment Creation Methods (New)
  // =========================================================================
  async clickNewSegment(): Promise<void> {
    await this.newSegmentButton.click();
  }

  async addAliasCondition(aliasValue: string): Promise<void> {
    await this.addConditionButton.click();
    await this.personalConditionCategoryButton.click();
    await this.aliasConditionMenuItem.click();
    await this.aliasMatchValueInput.click();
    await this.aliasMatchValueInput.fill(aliasValue);
  }

  async saveSegmentDefinition(): Promise<void> {
    await this.saveSegmentButton.click();
  }

  async nameAndSaveSegment(segmentName: string): Promise<void> {
    await this.segmentNameInput.click();
    await this.segmentNameInput.fill(segmentName);
    await this.finalSaveButton.click();
  }

  async addAliasConditionAndSaveDefinition(aliasValue: string): Promise<void> {
    await this.addAliasCondition(aliasValue);
    await this.saveSegmentDefinition();
  }

  getSegmentLinkByName(segmentName: string): Locator {
    // Helper to get the dynamic locator for a segment link
    return this.page.getByRole('link', {
      name: `Segment Name: ${segmentName}`
    });
  }

  async verifySegmentLinkIsVisible(segmentName: string): Promise<void> {
    const segmentLink = this.getSegmentLinkByName(segmentName);
    await expect(
      segmentLink,
      `Link for segment '${segmentName}' should be visible`
    ).toBeVisible();
  }

  async verifySegmentTotalUsers(
    segmentName: string,
    expectedUserCount: string,
    timeoutMs: number = 120000
  ): Promise<void> {
    await expect
      .poll(
        async () => {
          const segmentLinkLocator = this.getSegmentLinkByName(segmentName);
          const segmentRowLocator = this.page.getByRole('row').filter({
            has: segmentLinkLocator
          });
          const totalUsersSpanInRow =
            segmentRowLocator.getByLabel('Total Users');
          return (
            (await totalUsersSpanInRow.isVisible()) &&
            (await totalUsersSpanInRow.textContent()) === expectedUserCount
          );
        },
        {
          message: `Total users for segment '${segmentName}' should become '${expectedUserCount}' within ${timeoutMs}ms`,
          timeout: timeoutMs
        }
      )
      .toBeTruthy();
  }

  async createSegmentWithAlias(
    aliasValue: string,
    segmentName: string
  ): Promise<void> {
    await this.clickNewSegment();
    await this.addAliasCondition(aliasValue);
    await this.saveSegmentDefinition();
    await this.nameAndSaveSegment(segmentName);
    await this.verifySegmentLinkIsVisible(segmentName);
    await this.verifySegmentTotalUsers(segmentName, '1'); // Added validation for 1 user
  }
}
