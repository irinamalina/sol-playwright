import { BasePage } from "./BasePage";

export interface ContactFormData {
  fullName: string;
  email: string;
  zipCode: string;
  monthlyBill?: string;
  message?: string;
}

export class ContactPage extends BasePage {
  readonly container = this.page.getByTestId("contact-page");
  readonly form = this.page.getByTestId("contact-form");
  readonly fullNameInput = this.page.getByTestId("contact-fullname-input");
  readonly emailInput = this.page.getByTestId("contact-email-input");
  readonly zipInput = this.page.getByTestId("contact-zip-input");
  readonly billInput = this.page.getByTestId("contact-bill-input");
  readonly messageInput = this.page.getByTestId("contact-message-input");
  readonly submitButton = this.page.getByTestId("contact-submit-button");
  readonly submitError = this.page.getByTestId("contact-submit-error");
  readonly successPanel = this.page.getByTestId("contact-success");
  readonly fullNameError = this.page.getByTestId("contact-fullname-error");
  readonly emailError = this.page.getByTestId("contact-email-error");
  readonly zipError = this.page.getByTestId("contact-zip-error");

  async goto() {
    await this.navigateTo("/contact");
  }

  async fillForm(data: ContactFormData) {
    await this.fullNameInput.fill(data.fullName);
    await this.emailInput.fill(data.email);
    await this.zipInput.fill(data.zipCode);
    if (data.monthlyBill) await this.billInput.fill(data.monthlyBill);
    if (data.message) await this.messageInput.fill(data.message);
  }

  async submit() {
    await this.submitButton.click();
  }

  async requestQuote(data: ContactFormData) {
    await this.fillForm(data);
    await this.submit();
  }
}
