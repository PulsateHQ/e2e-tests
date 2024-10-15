import { BasePage } from '@_src/pages/base.page';
import { Page } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export class DashboardPage extends BasePage {
  url = `/mobile/apps/${process.env.APP_ID}/dashboard_beta`;

  constructor(page: Page) {
    super(page);
  }
}
