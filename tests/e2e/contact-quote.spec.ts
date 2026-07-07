import { test, expect } from "../../fixtures/base";
import { generateQuoteRequest } from "../../fixtures/test-data";
import { ContactPage } from "../../pages/ContactPage";

test.describe("Contact / free quote form", () => {
  test("submits a valid quote request", async ({ page }) => {
    const contactPage = new ContactPage(page);
    const quote = generateQuoteRequest();

    await contactPage.goto();
    await contactPage.requestQuote(quote);

    // Contact.jsx resets the form to its initial (blank) state in the same
    // update as flipping to the success view, so the confirmation always
    // falls back to "there" rather than echoing the submitted name.
    await expect(contactPage.successPanel).toBeVisible();
    await expect(contactPage.successPanel).toContainText("Thanks, there!");
  });

  test("requires a valid 5-digit ZIP code", async ({ page }) => {
    const contactPage = new ContactPage(page);
    const quote = generateQuoteRequest({ zipCode: "12" });

    await contactPage.goto();
    await contactPage.fillForm(quote);
    await contactPage.submit();

    await expect(contactPage.zipError).toHaveText(/valid 5-digit zip/i);
  });

  test("requires a valid email address", async ({ page }) => {
    const contactPage = new ContactPage(page);
    const quote = generateQuoteRequest({ email: "not-an-email" });

    await contactPage.goto();
    await contactPage.fillForm(quote);
    await contactPage.submit();

    await expect(contactPage.emailError).toHaveText(/valid email address/i);
  });
});
