import type { APIRequestContext, APIResponse } from "@playwright/test";

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  address?: string;
  plan?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface QuotePayload {
  fullName: string;
  email: string;
  zipCode: string;
  monthlyBill?: string;
  message?: string;
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Thin wrapper around the Solstice Solar REST API. Works with any
 * APIRequestContext — pass one whose baseURL is already the API origin
 * (the "api" Playwright project, or a context built in fixtures/base.ts).
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  health(): Promise<APIResponse> {
    return this.request.get("health");
  }

  register(payload: RegisterPayload): Promise<APIResponse> {
    return this.request.post("auth/register", { data: payload });
  }

  login(payload: LoginPayload): Promise<APIResponse> {
    return this.request.post("auth/login", { data: payload });
  }

  me(token: string): Promise<APIResponse> {
    return this.request.get("auth/me", { headers: authHeader(token) });
  }

  updateProfile(token: string, payload: { fullName?: string; address?: string; plan?: string }): Promise<APIResponse> {
    return this.request.put("auth/me", { data: payload, headers: authHeader(token) });
  }

  logout(token: string): Promise<APIResponse> {
    return this.request.post("auth/logout", { headers: authHeader(token) });
  }

  submitQuote(payload: QuotePayload): Promise<APIResponse> {
    return this.request.post("quotes", { data: payload });
  }

  myQuotes(token: string): Promise<APIResponse> {
    return this.request.get("quotes/mine", { headers: authHeader(token) });
  }

  dashboardSummary(token: string): Promise<APIResponse> {
    return this.request.get("dashboard/summary", { headers: authHeader(token) });
  }
}
