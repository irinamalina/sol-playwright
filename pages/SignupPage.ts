import { BasePage } from "./BasePage";

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  address?: string;
  plan?: string;
}

export class SignupPage extends BasePage {
  readonly heading = this.page.getByTestId("signup-heading");
  readonly form = this.page.getByTestId("signup-form");
  readonly fullNameInput = this.page.getByTestId("signup-fullname-input");
  readonly emailInput = this.page.getByTestId("signup-email-input");
  readonly addressInput = this.page.getByTestId("signup-address-input");
  readonly planSelect = this.page.getByTestId("signup-plan-select");
  readonly passwordInput = this.page.getByTestId("signup-password-input");
  readonly confirmPasswordInput = this.page.getByTestId("signup-confirm-password-input");
  readonly submitButton = this.page.getByTestId("signup-submit-button");
  readonly submitError = this.page.getByTestId("signup-submit-error");
  readonly fullNameError = this.page.getByTestId("signup-fullname-error");
  readonly emailError = this.page.getByTestId("signup-email-error");
  readonly passwordError = this.page.getByTestId("signup-password-error");
  readonly confirmPasswordError = this.page.getByTestId("signup-confirm-password-error");
  readonly loginLink = this.page.getByTestId("signup-login-link");

  async goto() {
    await this.navigateTo("/signup");
  }

  async fillForm(data: SignupFormData) {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    if (data.address) await this.addressInput.fill(data.address);
    if (data.plan) await this.planSelect.selectOption(data.plan);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword ?? data.password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async signup(data: SignupFormData) {
    await this.fillForm(data);
    await this.submit();
  }
}
