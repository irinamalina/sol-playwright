import { test, expect } from "@playwright/test";
import { ApiClient } from "../../api/api-client";
import { generateQuoteRequest, generateUser } from "../../fixtures/test-data";

test.describe("Quotes API", () => {
  test("accepts a valid quote request from an anonymous visitor", async ({ request }) => {
    const apiClient = new ApiClient(request);
    const quote = generateQuoteRequest();

    const response = await apiClient.submitQuote(quote);

    expect(response.status()).toBe(201);
    const { quote: created } = await response.json();
    expect(created.email).toBe(quote.email.toLowerCase());
    expect(created.zip_code).toBe(quote.zipCode);
  });

  test("rejects an invalid ZIP code", async ({ request }) => {
    const apiClient = new ApiClient(request);
    const quote = generateQuoteRequest({ zipCode: "abc" });

    const response = await apiClient.submitQuote(quote);

    expect(response.status()).toBe(400);
  });

  test("rejects a missing full name", async ({ request }) => {
    const apiClient = new ApiClient(request);
    const quote = generateQuoteRequest({ fullName: "" });

    const response = await apiClient.submitQuote(quote);

    expect(response.status()).toBe(400);
  });

  test("/quotes/mine returns an empty list for a fresh user", async ({ request }) => {
    // Note: POST /quotes is a public, unauthenticated endpoint (no requireAuth
    // middleware), so it never attaches the submitting quote to the caller's
    // account even if a token is sent. /quotes/mine is only ever populated by
    // quotes created directly against the data store.
    const apiClient = new ApiClient(request);
    const user = generateUser();
    const registerResponse = await apiClient.register(user);
    const { token } = await registerResponse.json();

    const response = await apiClient.myQuotes(token);

    expect(response.status()).toBe(200);
    const { quotes } = await response.json();
    expect(quotes).toEqual([]);
  });

  test("rejects /quotes/mine without authentication", async ({ request }) => {
    const apiClient = new ApiClient(request);

    const response = await apiClient.myQuotes("");

    expect(response.status()).toBe(401);
  });
});
