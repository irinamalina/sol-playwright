import type { Page } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}

  protected async navigateTo(path: string) {
    await this.page.goto(path);
  }
}
