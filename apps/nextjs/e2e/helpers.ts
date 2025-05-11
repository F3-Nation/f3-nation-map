import type { BrowserContext, Locator, Page } from "@playwright/test";

export const testLogger = (context: string) => ({
  log: (action: string, data?: Record<string, unknown>) => {
    console.log(context, {
      action,
      ...data,
    });
  },
});

export const waitForMap = async (page: Page, timeout = 10000) => {
  const logger = testLogger("waitForMap");
  logger.log("Waiting for map to load");

  try {
    await page.waitForSelector('[aria-label="Map"]', {
      timeout,
      state: "visible",
    });
    logger.log("Map loaded successfully");
  } catch (error) {
    logger.log("Map failed to load", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const setupTestEnvironment = async (
  page: Page,
  context: BrowserContext,
) => {
  const logger = testLogger("setupTestEnvironment");
  logger.log("Setting up test environment");

  // Grant location permissions
  await context.grantPermissions(["geolocation"]);
};

export const setupAdminTestEnvironment = async (page: Page) => {
  await page.goto("/?lat=36.211104&lng=-81.660849&zoom=3");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Sign in (Dev Mode)" }).click();
};

export const turnOnEditMode = async (page: Page) => {
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Close" }).click();
};

export const goToAdminPortal = async (page: Page) => {
  await page.goto("/admin");
  // await page.getByRole("button", { name: "Settings" }).click();
  // await page.getByRole("button", { name: "Admin Portal" }).click();
};

export const teardownTestEnvironment = async (context: BrowserContext) => {
  const logger = testLogger("teardownTestEnvironment");
  logger.log("Tearing down test environment");

  // Stop tracing and save it
  await context.tracing.stop({ path: "test-results/trace.zip" });
};

export const setStore = async (
  page: Page,
  store: "map-store",
  value: Record<string, unknown>,
) => {
  await page.addInitScript(`
    window.localStorage.setItem('${store}', JSON.stringify(${JSON.stringify(value)}));
  `);
};

/**
 * Cleans up test data from the database.
 * This function should be called at the beginning of test suites to ensure a clean state.
 */
export const cleanupTestData = async (page: Page) => {
  const logger = testLogger("cleanupTestData");
  logger.log("Cleaning up test data");

  // First navigate to admin portal (if not already there)
  await goToAdminPortal(page);

  // Delete any test items that might exist from previous test runs
  await deleteTestItems(page, "Events", "SUPER TEST");
  await deleteTestItems(page, "Event Types", "SUPER TEST");
  await deleteTestItems(page, "Locations", "SUPER TEST");
  await deleteTestItems(page, "AOs", "SUPER TEST");
  await deleteTestItems(page, "Regions", "SUPER TEST");
  await deleteTestItems(page, "Areas", "SUPER TEST");
  await deleteTestItems(page, "Sectors", "SUPER TEST");

  logger.log("Test data cleanup completed");
};

const waitOrMoveOn = async (locator: Locator, timeoutMs = 1000) => {
  try {
    await locator.first().waitFor({ timeout: timeoutMs, state: "attached" });
    return await locator.all();
  } catch (error) {
    // Timeout occurred or element not found
    return [];
  }
};

/**
 * Helper function to delete all items containing the search term
 * from a specific section in the admin portal
 */
async function deleteTestItems(
  page: Page,
  section: string,
  searchTerm: string,
) {
  const logger = testLogger(`deleteTestItems:${section}`);
  logger.log("Deleting test items", { section, searchTerm });

  // Navigate to the correct section
  await page.getByRole("link", { name: section }).click();
  await page.waitForTimeout(250);

  // Search for test items
  await page.getByRole("textbox", { name: "Search rows..." }).click();
  await page.getByRole("textbox", { name: "Search rows..." }).fill(searchTerm);

  // Get count of matching items
  const items = await waitOrMoveOn(page.getByText(new RegExp(searchTerm, "i")));
  logger.log(`Found ${items.length} items to delete`, { count: items.length });

  // Delete all found items
  for (let i = 0; i < items.length; i++) {
    try {
      // Items list changes after each deletion, so we need to search again
      const currentItems = await page
        .getByText(new RegExp(searchTerm, "i"))
        .all();
      if (currentItems.length === 0) break;

      // Click the first item - currentItems[0] is checked above so it's safe to use
      const firstItem = currentItems[0];
      if (firstItem) {
        await firstItem.click();

        // Click delete button and confirm
        await page.getByRole("button", { name: "Delete" }).click();
        await page.getByRole("button", { name: "Delete" }).click();

        // Wait for confirmation
        await page.waitForTimeout(500);

        logger.log(`Deleted item ${i + 1}`, {
          remaining: currentItems.length - 1,
        });
      }
    } catch (error) {
      logger.log("Error deleting item", {
        error: error instanceof Error ? error.message : String(error),
        index: i,
      });
      break;
    }
  }
}

export const fillTimeInput = async (
  page: Page,
  inputId: string,
  time: string,
) => {
  await page.locator(`#${inputId}`).click();
  for (const char of time) {
    await page.keyboard.press(char);
  }
};
