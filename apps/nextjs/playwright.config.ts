import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  timeout: 120000,
  use: {
    baseURL: "http://localhost:3000",
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    permissions: ["geolocation"],
  },
  webServer: {
    command: "pnpm -F nextjs dev",
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  retries: 1,
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      testMatch: /.*\.spec\.ts/,
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use prepared auth state.
        storageState: "./e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
};

export default config;
