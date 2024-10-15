import { BasePage } from '@_src/pages/base.page';

export class DashboardPage extends BasePage {
  url = `/mobile/apps/${process.env.APP_ID}/dashboard_beta`;
}
