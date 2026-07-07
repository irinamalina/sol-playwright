import { test, expect } from "../../fixtures/base";
import { DashboardPage } from "../../pages/DashboardPage";

test.describe("Dashboard", () => {
  test("shows the authenticated user's system snapshot", async ({ authenticatedPage, registeredUser }) => {
    const dashboard = new DashboardPage(authenticatedPage);

    await expect(dashboard.heading).toContainText(registeredUser.user.fullName.split(" ")[0]);
    await expect(dashboard.statSystemSize).toBeVisible();
    await expect(dashboard.statPanels).toBeVisible();
    await expect(dashboard.statProduction).toBeVisible();
    await expect(dashboard.statSavings).toBeVisible();
    await expect(dashboard.co2Offset).toBeVisible();
  });

  test("redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("persists a profile address update", async ({ authenticatedPage }) => {
    // Dashboard.jsx sets saveStatus to "saved" and editing to false in the
    // same update, so the transient "Saved." message never actually has a
    // render where it's visible - asserting persistence directly instead.
    const dashboard = new DashboardPage(authenticatedPage);
    const newAddress = "742 Evergreen Terrace, Springfield";

    await dashboard.editProfile({ address: newAddress });
    await dashboard.editProfileToggle.click();

    await expect(dashboard.profileAddressInput).toHaveValue(newAddress);
  });
});
