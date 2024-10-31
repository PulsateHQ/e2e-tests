import { MainNavigationComponent } from '@_src/ui/components/mainNavigation.component';
import { SideBarComponent } from '@_src/ui/components/sideBar.component';
import { BeaconsPage } from '@_src/ui/pages/beacons.page';
import { CampaignStatsPage } from '@_src/ui/pages/campaignStats.page';
import { CampaignsPage } from '@_src/ui/pages/campaigns.page';
import { CompanyRegistrationPage } from '@_src/ui/pages/companyRegistration.page';
import { DashboardPage } from '@_src/ui/pages/dashboard.page';
import { ForgotPasswordPage } from '@_src/ui/pages/forgotPassword.page';
import { GeofencesPage } from '@_src/ui/pages/geofences.page';
import { JourneysPage } from '@_src/ui/pages/journeys.page';
import { LoginPage } from '@_src/ui/pages/login.page';
import { SegmentsPage } from '@_src/ui/pages/segments.page';
import { UsersPage } from '@_src/ui/pages/users.page';
import { test as baseTest } from '@playwright/test';

interface Pages {
  loginPage: LoginPage;
  forgotPasswordPage: ForgotPasswordPage;
  companyRegistrationPage: CompanyRegistrationPage;
  dashboardPage: DashboardPage;
  campaignStatsPage: CampaignStatsPage;
  segmentsPage: SegmentsPage;
  geofencesPage: GeofencesPage;
  beaconsPage: BeaconsPage;
  campaignsPage: CampaignsPage;
  journeysPage: JourneysPage;
  usersPage: UsersPage;
  sideBarComponent: SideBarComponent;
  mainNavigationComponent: MainNavigationComponent;
}

export const pageObjectTest = baseTest.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
  forgotPasswordPage: async ({ page }, use) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await use(forgotPasswordPage);
  },
  companyRegistrationPage: async ({ page }, use) => {
    const companyRegistrationPage = new CompanyRegistrationPage(page);
    await companyRegistrationPage.goto();
    await use(companyRegistrationPage);
  },
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
  campaignStatsPage: async ({ page }, use) => {
    const campaignStatsPage = new CampaignStatsPage(page);
    await use(campaignStatsPage);
  },
  segmentsPage: async ({ page }, use) => {
    const segmentsPage = new SegmentsPage(page);
    await use(segmentsPage);
  },
  geofencesPage: async ({ page }, use) => {
    const geofencesPage = new GeofencesPage(page);
    await use(geofencesPage);
  },
  beaconsPage: async ({ page }, use) => {
    const beaconsPage = new BeaconsPage(page);
    await use(beaconsPage);
  },
  campaignsPage: async ({ page }, use) => {
    const campaignsPage = new CampaignsPage(page);
    await use(campaignsPage);
  },
  journeysPage: async ({ page }, use) => {
    const journeysPage = new JourneysPage(page);
    await use(journeysPage);
  },
  usersPage: async ({ page }, use) => {
    const usersPage = new UsersPage(page);
    await use(usersPage);
  },
  sideBarComponent: async ({ page }, use) => {
    const sideBarComponent = new SideBarComponent(page);
    await use(sideBarComponent);
  },
  mainNavigationComponent: async ({ page }, use) => {
    const mainNavigationComponent = new MainNavigationComponent(page);
    await use(mainNavigationComponent);
  }
});
