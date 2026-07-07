import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly heading = this.page.getByTestId("login-heading");
  readonly form = this.page.getByTestId("login-form");
  readonly emailInput = this.page.getByTestId("login-email-input");
  readonly passwordInput = this.page.getByTestId("login-password-input");
  readonly submitButton = this.page.getByTestId("login-submit-button");
  readonly errorMessage = this.page.getByTestId("login-error");
  readonly signupLink = this.page.getByTestId("login-signup-link");

  async goto() {
    await this.navigateTo("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
