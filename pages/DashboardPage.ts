import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
  readonly heading = this.page.getByTestId("dashboard-heading");
  readonly planLabel = this.page.getByTestId("dashboard-plan-label");
  readonly editProfileToggle = this.page.getByTestId("dashboard-edit-profile-toggle");
  readonly profileForm = this.page.getByTestId("dashboard-profile-form");
  readonly profileNameInput = this.page.getByTestId("dashboard-profile-name-input");
  readonly profileAddressInput = this.page.getByTestId("dashboard-profile-address-input");
  readonly profileSaveButton = this.page.getByTestId("dashboard-profile-save-button");
  readonly profileSavedMessage = this.page.getByTestId("dashboard-profile-saved");
  readonly profileErrorMessage = this.page.getByTestId("dashboard-profile-error");
  readonly loading = this.page.getByTestId("dashboard-loading");
  readonly statSystemSize = this.page.getByTestId("stat-system-size");
  readonly statPanels = this.page.getByTestId("stat-panels");
  readonly statProduction = this.page.getByTestId("stat-production");
  readonly statSavings = this.page.getByTestId("stat-savings");
  readonly co2Offset = this.page.getByTestId("co2-offset");

  async goto() {
    await this.navigateTo("/dashboard");
  }

  async editProfile(data: { fullName?: string; address?: string }) {
    await this.editProfileToggle.click();
    if (data.fullName !== undefined) {
      await this.profileNameInput.fill(data.fullName);
    }
    if (data.address !== undefined) {
      await this.profileAddressInput.fill(data.address);
    }
    await this.profileSaveButton.click();
  }

  productionBar(monthIndex: number) {
    return this.page.getByTestId(`production-bar-${monthIndex}`);
  }
}
