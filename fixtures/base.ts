import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { API_BASE_URL } from "../config";
import { ApiClient } from "../api/api-client";
import { generateUser } from "./test-data";

const TOKEN_KEY = "solstice_token";

export interface RegisteredUser {
  fullName: string;
  email: string;
  password: string;
  address: string;
  plan: string;
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    address: string | null;
    plan: string;
  };
}

type Fixtures = {
  apiClient: ApiClient;
  registeredUser: RegisteredUser;
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  // A request context pinned to the API origin, independent of whichever
  // baseURL the current project uses for `page` (the client app).
  apiClient: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: API_BASE_URL });
    await use(new ApiClient(context));
    await context.dispose();
  },

  // Creates a brand-new user directly through the API - faster and more
  // reliable than driving the signup form for tests that don't care about
  // the signup UX itself.
  registeredUser: async ({ apiClient }, use) => {
    const payload = generateUser();
    const response = await apiClient.register(payload);
    if (!response.ok()) {
      throw new Error(`Failed to provision test user: ${response.status()} ${await response.text()}`);
    }
    const body = await response.json();
    await use({ ...payload, token: body.token, user: body.user });
  },

  // A page with a valid session already in localStorage, sitting on the
  // dashboard. Use this whenever a test needs to start already logged in.
  authenticatedPage: async ({ page, registeredUser }, use) => {
    await page.goto("/");
    await page.evaluate(
      ({ key, token }) => window.localStorage.setItem(key, token),
      { key: TOKEN_KEY, token: registeredUser.token }
    );
    await page.goto("/dashboard");
    await use(page);
  },
});

export { expect };
