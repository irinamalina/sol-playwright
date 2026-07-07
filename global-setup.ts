import type { FullConfig } from "@playwright/test";
import { API_URL, BASE_URL } from "./config";

async function checkReachable(url: string, label: string) {
  try {
    const res = await fetch(url);
    if (res.status >= 500) {
      throw new Error(`${label} responded with HTTP ${res.status}`);
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Could not reach ${label} at ${url}. Start it manually, or drop SKIP_WEB_SERVER ` +
        `so Playwright can launch it for you. Original error: ${reason}`
    );
  }
}

export default async function globalSetup(_config: FullConfig) {
  await checkReachable(`${API_URL}/health`, "the API server");
  await checkReachable(BASE_URL, "the client app");
}
