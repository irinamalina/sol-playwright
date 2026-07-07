import { test, expect } from "../../fixtures/base";
import { generateUser } from "../../fixtures/test-data";
import { LoginPage } from "../../pages/LoginPage";
import { SignupPage } from "../../pages/SignupPage";
import { NavbarComponent } from "../../pages/NavbarComponent";

test.describe("Signup", () => {
  test("creates a new account and lands on the dashboard", async ({ page }) => {
    const signupPage = new SignupPage(page);
    const navbar = new NavbarComponent(page);
    const user = generateUser();

    await signupPage.goto();
    await signupPage.signup(user);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(navbar.dashboardLink).toContainText(user.fullName.split(" ")[0]);
  });

  test("shows a validation error for a short password", async ({ page }) => {
    const signupPage = new SignupPage(page);
    const user = generateUser({ password: "short", confirmPassword: "short" });

    await signupPage.goto();
    await signupPage.fillForm(user);
    await signupPage.submit();

    await expect(signupPage.passwordError).toHaveText(/at least 8 characters/i);
    await expect(page).toHaveURL(/\/signup$/);
  });

  test("shows a validation error when passwords do not match", async ({ page }) => {
    const signupPage = new SignupPage(page);
    const user = generateUser();

    await signupPage.goto();
    await signupPage.fillForm({ ...user, confirmPassword: `${user.password}x` });
    await signupPage.submit();

    await expect(signupPage.confirmPasswordError).toHaveText(/do not match/i);
  });

  test("rejects an email that is already registered", async ({ page, registeredUser }) => {
    const signupPage = new SignupPage(page);

    await signupPage.goto();
    await signupPage.signup(registeredUser);

    await expect(signupPage.submitError).toHaveText(/already exists/i);
  });
});

test.describe("Login", () => {
  test("logs in with valid credentials", async ({ page, registeredUser }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("shows an error for an incorrect password", async ({ page, registeredUser }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(registeredUser.email, "wrong-password-123");

    await expect(loginPage.errorMessage).toHaveText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("shows an error for an unknown email", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("nobody-at-all@solstice.test", "whatever-123");

    await expect(loginPage.errorMessage).toHaveText(/invalid email or password/i);
  });
});

test.describe("Logout", () => {
  test("logs the user out and returns them to the marketing site", async ({ authenticatedPage }) => {
    const navbar = new NavbarComponent(authenticatedPage);

    await navbar.logout();

    await expect(authenticatedPage).toHaveURL(/\/$/);
    await expect(navbar.loginLink).toBeVisible();
  });
});
