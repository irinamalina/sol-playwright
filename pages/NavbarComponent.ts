import type { Page, Locator } from "@playwright/test";

export class NavbarComponent {
  readonly root: Locator;
  readonly logo: Locator;
  readonly menuToggle: Locator;
  readonly loginLink: Locator;
  readonly signupLink: Locator;
  readonly dashboardLink: Locator;
  readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByTestId("navbar");
    this.logo = page.getByTestId("nav-logo");
    this.menuToggle = page.getByTestId("nav-menu-toggle");
    this.loginLink = page.getByTestId("nav-login-link");
    this.signupLink = page.getByTestId("nav-signup-link");
    this.dashboardLink = page.getByTestId("nav-dashboard-link");
    this.logoutButton = page.getByTestId("nav-logout-button");
  }

  navLink(label: string): Locator {
    const slug = label.toLowerCase().replace(/\s+/g, "-");
    return this.page.getByTestId(`nav-link-${slug}`);
  }

  async logout() {
    await this.logoutButton.click();
  }
}
