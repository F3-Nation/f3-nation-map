import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./e2e",
  timeout: 120000,
  use: {
    baseURL: "https://staging.app.f3bynight.com",
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
};

export default config;
