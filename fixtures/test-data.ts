import { faker } from "@faker-js/faker";
import type { RegisterPayload, QuotePayload } from "../api/api-client";

/**
 * The backend persists users/quotes to a flat JSON file with no cleanup
 * endpoint (see server/db/index.js), so every run - including repeated
 * unattended agent runs - must generate emails that have never been used
 * before. A timestamp + random suffix keeps that true indefinitely.
 */
function uniqueEmail(prefix = "qa"): string {
  const unique = `${Date.now()}-${faker.string.alphanumeric(8).toLowerCase()}`;
  return `${prefix}+${unique}@solstice.test`;
}

export function generateUser(overrides: Partial<RegisterPayload & { confirmPassword: string }> = {}) {
  const password = overrides.password ?? "Sunshine!2024";
  return {
    fullName: faker.person.fullName(),
    email: uniqueEmail(),
    password,
    confirmPassword: password,
    address: faker.location.streetAddress(),
    plan: "residential-starter",
    ...overrides,
  };
}

export function generateQuoteRequest(overrides: Partial<QuotePayload> = {}): QuotePayload {
  return {
    fullName: faker.person.fullName(),
    email: uniqueEmail("quote"),
    zipCode: faker.string.numeric(5),
    monthlyBill: String(faker.number.int({ min: 80, max: 400 })),
    message: faker.lorem.sentence(),
    ...overrides,
  };
}
