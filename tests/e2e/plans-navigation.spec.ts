import { test, expect } from "../../fixtures/base";
import { PlansPage } from "../../pages/PlansPage";
import { NavbarComponent } from "../../pages/NavbarComponent";

test.describe("Plans page", () => {
  test("lists all three plans", async ({ page }) => {
    const plansPage = new PlansPage(page);
    await plansPage.goto();

    await expect(plansPage.planCard("residential-starter")).toBeVisible();
    await expect(plansPage.planCard("residential-plus")).toBeVisible();
    await expect(plansPage.planCard("whole-home-battery")).toBeVisible();
  });

  test("choosing a plan navigates to signup", async ({ page }) => {
    const plansPage = new PlansPage(page);
    await plansPage.goto();

    await plansPage.choosePlan("residential-plus");

    await expect(page).toHaveURL(/\/signup$/);
  });
});

test.describe("Primary navigation", () => {
  test("navbar links move between marketing pages", async ({ page }) => {
    const navbar = new NavbarComponent(page);
    await page.goto("/");

    await navbar.navLink("Plans").click();
    await expect(page).toHaveURL(/\/plans$/);

    await navbar.navLink("Contact").click();
    await expect(page).toHaveURL(/\/contact$/);

    await navbar.navLink("About").click();
    await expect(page).toHaveURL(/\/about$/);

    await navbar.navLink("How It Works").click();
    await expect(page).toHaveURL(/\/how-it-works$/);
  });

  test("logged-out visitors see login and signup links", async ({ page }) => {
    const navbar = new NavbarComponent(page);
    await page.goto("/");

    await expect(navbar.loginLink).toBeVisible();
    await expect(navbar.signupLink).toBeVisible();
  });
});
