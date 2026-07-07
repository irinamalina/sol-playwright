import { BasePage } from "./BasePage";

export type PlanId = "residential-starter" | "residential-plus" | "whole-home-battery";

export class PlansPage extends BasePage {
  readonly container = this.page.getByTestId("plans-page");

  async goto() {
    await this.navigateTo("/plans");
  }

  planCard(planId: PlanId) {
    return this.page.getByTestId(`plan-card-${planId}`);
  }

  selectPlanButton(planId: PlanId) {
    return this.page.getByTestId(`plan-select-${planId}`);
  }

  async choosePlan(planId: PlanId) {
    await this.selectPlanButton(planId).click();
  }
}
