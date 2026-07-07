import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { API_BASE_URL, API_URL, BASE_URL, SKIP_WEB_SERVER } from "./config";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Multiple machine-readable reporters so an agent (or CI job) can parse
  // results without scraping terminal output.
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: "chromium",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "api",
      testDir: "./tests/api",
      use: { baseURL: API_BASE_URL },
    },
  ],

  // Boots the sibling client/server apps automatically. Set SKIP_WEB_SERVER=1
  // when something else (an agent, a CI job, docker-compose) already owns
  // those processes.
  webServer: SKIP_WEB_SERVER
    ? undefined
    : [
        {
          command: "npm run dev",
          cwd: path.resolve(__dirname, "../server"),
          url: `${API_URL}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
        {
          command: "npm run dev",
          cwd: path.resolve(__dirname, "../client"),
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
      ],
});
