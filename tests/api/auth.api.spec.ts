import { test, expect } from "@playwright/test";
import { ApiClient } from "../../api/api-client";
import { generateUser } from "../../fixtures/test-data";

test.describe("Auth API", () => {
  test("registers a new user and returns a token", async ({ request }) => {
    const apiClient = new ApiClient(request);
    const user = generateUser();

    const response = await apiClient.register(user);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(body.user.email).toBe(user.email);
    expect(body.user.password).toBeUndefined();
  });

  test("rejects a duplicate email with 409", async ({ request }) => {
    const apiClient = new ApiClient(request);
    const user = generateUser();

    await apiClient.register(user);
    const response = await apiClient.register(user);

    expect(response.status()).toBe(409);
  });

  test("rejects a password shorter than 8 characters", async ({ request }) => {
    const apiClient = new ApiClient(request);
    const user = generateUser({ password: "short", confirmPassword: "short" });

    const response = await apiClient.register(user);

    expect(response.status()).toBe(400);
  });

  test("rejects a malformed email", async ({ request }) => {
    const apiClient = new ApiClient(request);
    const user = generateUser({ email: "not-an-email" });

    const response = await apiClient.register(user);

    expect(response.status()).toBe(400);
  });

  test("logs in and fetches the current user via /auth/me", async ({ request }) => {
    const apiClient = new ApiClient(request);
    const user = generateUser();
    await apiClient.register(user);

    const loginResponse = await apiClient.login({ email: user.email, password: user.password });
    expect(loginResponse.status()).toBe(200);
    const { token } = await loginResponse.json();

    const meResponse = await apiClient.me(token);
    expect(meResponse.status()).toBe(200);
    const { user: me } = await meResponse.json();
    expect(me.email).toBe(user.email);
  });

  test("rejects invalid login credentials with 401", async ({ request }) => {
    const apiClient = new ApiClient(request);

    const response = await apiClient.login({ email: "nobody@solstice.test", password: "whatever-123" });

    expect(response.status()).toBe(401);
  });

  test("rejects requests to /auth/me without a token", async ({ request }) => {
    const apiClient = new ApiClient(request);

    const response = await apiClient.me("");

    expect(response.status()).toBe(401);
  });

  test("updates the authenticated user's profile", async ({ request }) => {
    const apiClient = new ApiClient(request);
    const user = generateUser();
    const registerResponse = await apiClient.register(user);
    const { token } = await registerResponse.json();

    const response = await apiClient.updateProfile(token, { address: "1 Solar Way" });

    expect(response.status()).toBe(200);
    const { user: updated } = await response.json();
    expect(updated.address).toBe("1 Solar Way");
  });
});
