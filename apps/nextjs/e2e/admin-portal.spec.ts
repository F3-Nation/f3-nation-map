import { expect, test } from "@playwright/test";

import { cleanupTestData, fillTimeInput, goToAdminPortal } from "./helpers";

test.describe("Admin Portal", () => {
  test.beforeAll(async ({ browser }) => {
    // Create a new page for cleanup only
    const context = await browser.newContext();
    const page = await context.newPage();

    // Clean up any leftover test data before starting tests
    await cleanupTestData(page);

    // Close the context when done
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // await setupAdminTestEnvironment(page);
    await goToAdminPortal(page);
  });

  test("go to Sectors and add a new Sector", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "Sectors" }).click();
    await expect(page.getByRole("heading", { name: "Sectors" })).toBeVisible();
    await page.getByRole("button", { name: "Add Sector" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST SECTOR");
    await page.getByRole("combobox").filter({ hasText: /^$/ }).click();
    await page.getByRole("option", { name: "F3 Nation" }).click();

    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("edit the new Sector", async ({ page }) => {
    await page.getByRole("link", { name: "Sectors" }).click();
    await expect(page.getByRole("heading", { name: "Sectors" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST SECTOR").first()).toBeVisible();
    await page.getByText("SUPER TEST SECTOR").first().click();
    await expect(
      page.getByRole("heading", { name: "Edit Sector" }),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue(
      "SUPER TEST SECTOR",
    );
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST SECTOR 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST SECTOR 2").first()).toBeVisible();
  });

  test("go to Areas and add a new Area", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "Areas" }).click();
    await expect(page.getByRole("heading", { name: "Areas" })).toBeVisible();
    await page.getByRole("button", { name: "Add Area" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST AREA");
    await page.getByRole("combobox").filter({ hasText: /^$/ }).click();
    await page
      .getByRole("option", { name: "SUPER TEST SECTOR" })
      .first()
      .click();

    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("edit the new Area", async ({ page }) => {
    await page.getByRole("link", { name: "Areas" }).click();
    await expect(page.getByRole("heading", { name: "Areas" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST AREA").first()).toBeVisible();
    await page.getByText("SUPER TEST AREA").first().click();
    await expect(
      page.getByRole("heading", { name: "Edit Area" }),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue(
      "SUPER TEST AREA",
    );
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST AREA 2");
    await page.getByRole("button", { name: "Save Changes" }).click();

    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST AREA 2")).toBeVisible();
  });

  test("go to Regions and add a new Region", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "Regions" }).click();
    await expect(page.getByRole("heading", { name: "Regions" })).toBeVisible();
    await page.getByRole("button", { name: "Add Region" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST REGION");
    await page.getByRole("combobox").filter({ hasText: /^$/ }).click();
    await page.getByRole("option", { name: "SUPER TEST AREA 2" }).click();

    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST REGION").first()).toBeVisible();
  });

  test("edit the new Region", async ({ page }) => {
    await page.getByRole("link", { name: "Regions" }).click();
    await expect(page.getByRole("heading", { name: "Regions" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST REGION").first().click();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue(
      "SUPER TEST REGION",
    );
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST REGION 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST REGION 2")).toBeVisible();
  });

  test("go to AOs and add a new AO", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "AOs" }).click();
    await expect(page.getByRole("heading", { name: "AOs" })).toBeVisible();
    await page.getByRole("button", { name: "Add AO" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST AO");
    await page.getByRole("combobox").filter({ hasText: /^$/ }).click();
    await page.getByPlaceholder("Select a region").fill("super");
    await page
      .getByRole("option", { name: "SUPER TEST REGION 2" })
      .first()
      .click();

    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Active", exact: true }).click();
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
  });

  test("edit the new AO", async ({ page }) => {
    await page.getByRole("link", { name: "AOs" }).click();
    await expect(page.getByRole("heading", { name: "AOs" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST AO").first().click();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue(
      "SUPER TEST AO",
    );
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST AO 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST AO 2")).toBeVisible();
  });

  test("go to Event Types and add a new Event Type", async ({ page }) => {
    await page.getByRole("link", { name: "Event Types" }).click();
    await expect(
      page.getByRole("heading", { name: "Event Types" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Add Event Type" }).click();
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST EVENT TYPE");
    await page
      .locator('textarea[name="description"]')
      .fill("Test event type description");
    await page.getByRole("combobox", { name: "Event Category" }).click();
    await page.getByRole("option", { name: "1st F" }).click();
    await page
      .getByRole("combobox")
      .filter({ hasText: "Select a region" })
      .click();
    await page.getByPlaceholder("Select a region").fill("SUPER");
    await page
      .getByRole("option", { name: "SUPER TEST REGION 2" })
      .first()
      .click();
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST EVENT TYPE")).toBeVisible();
  });

  test("edit the new Event Type", async ({ page }) => {
    await page.getByRole("link", { name: "Event Types" }).click();
    await expect(
      page.getByRole("heading", { name: "Event Types" }),
    ).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST EVENT TYPE").click();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue(
      "SUPER TEST EVENT TYPE",
    );
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST EVENT TYPE 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST EVENT TYPE 2")).toBeVisible();
  });

  test("go to Locations and add a new Location", async ({ page }) => {
    await page.getByRole("link", { name: "Locations" }).click();
    await expect(
      page.getByRole("heading", { name: "Locations" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Add Location" }).click();
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST LOCATION");
    await page.waitForTimeout(250);
    await page
      .getByRole("combobox")
      .filter({ hasText: "Select a region" })
      .click();
    await page.getByPlaceholder("Select a region").fill("SUPER");
    await page
      .getByRole("option", { name: "SUPER TEST REGION 2" })
      .first()
      .click();
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST LOCATION").first()).toBeVisible();
  });

  test("edit the new Location", async ({ page }) => {
    await page.getByRole("link", { name: "Locations" }).click();
    await expect(
      page.getByRole("heading", { name: "Locations" }),
    ).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST LOCATION").first().click();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue(
      new RegExp("SUPER TEST LOCATION", "i"),
    );
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST LOCATION 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST LOCATION 2")).toBeVisible();
  });

  test("go to Events and add a new Event", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "Events" }).click();
    await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
    await page.getByRole("button", { name: "Add Event" }).click();

    await expect(
      page.getByRole("heading", { name: "Edit Event" }),
    ).toBeVisible();

    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST EVENT");

    await page
      .getByRole("combobox")
      .filter({ hasText: "Select a region" })
      .click();
    await page.getByPlaceholder("Select a region").fill("SUPER");
    await page
      .getByRole("option", { name: "SUPER TEST REGION 2" })
      .first()
      .click();

    // Select the AO
    await page
      .getByRole("combobox")
      .filter({ hasText: "Select an AO" })
      .click();
    await page.getByRole("option", { name: "SUPER TEST AO 2" }).first().click();

    // See if location already is selected
    try {
      await expect(
        page.getByRole("combobox").filter({ hasText: "SUPER TEST LOCATION 2" }),
      ).toBeVisible();
    } catch (error) {
      // Select a location
      await page
        .getByRole("combobox")
        .filter({ hasText: "Select a location" })
        .click();
      await page.getByPlaceholder("Select a location").fill("SUPER");
      await page
        .getByRole("option", { name: "SUPER TEST LOCATION 2" })
        .first()
        .click();
    }

    // Day of the week
    await page.getByRole("combobox", { name: "Day of Week" }).click();
    await page.getByRole("option", { name: "Wednesday" }).click();

    // Select Event Type
    await page
      .getByRole("combobox")
      .filter({ hasText: "Select event types" })
      .click();
    await page.getByPlaceholder("Select event types").fill("SUPER");
    await page
      .getByRole("option", { name: "SUPER TEST EVENT TYPE 2" })
      .first()
      .click();

    await page
      .getByRole("combobox")
      .filter({ hasText: "SUPER TEST EVENT TYPE 2" })
      .click();

    // Set date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0] ?? "";

    await page.getByLabel("Start Date").fill(dateString);
    await fillTimeInput(page, "startTime", "0600A");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await fillTimeInput(page, "endTime", "0700A");

    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST EVENT")).toBeVisible();
  });

  test("edit the new Event", async ({ page }) => {
    await page.getByRole("link", { name: "Events" }).click();
    await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST EVENT").click();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue(
      "SUPER TEST EVENT",
    );
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST EVENT 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST EVENT 2")).toBeVisible();
  });

  // Delete all test items in reverse order
  test("delete the Event", async ({ page }) => {
    await page.getByRole("link", { name: "Events" }).click();
    await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST EVENT 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST EVENT 2")).not.toBeVisible();
  });

  test("delete the Event Type", async ({ page }) => {
    await page.getByRole("link", { name: "Event Types" }).click();
    await expect(
      page.getByRole("heading", { name: "Event Types" }),
    ).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST EVENT TYPE 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST EVENT TYPE 2")).not.toBeVisible();
  });

  test("delete the new AO", async ({ page }) => {
    await page.getByRole("link", { name: "AOs" }).click();
    await expect(page.getByRole("heading", { name: "AOs" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST AO 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST AO 2")).not.toBeVisible();
  });

  test("delete the new Region", async ({ page }) => {
    await page.getByRole("link", { name: "Regions" }).click();
    await expect(page.getByRole("heading", { name: "Regions" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST REGION 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST REGION 2")).not.toBeVisible();
  });

  test("delete the new Area", async ({ page }) => {
    await page.getByRole("link", { name: "Areas" }).click();
    await expect(page.getByRole("heading", { name: "Areas" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST AREA 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST AREA 2")).not.toBeVisible();
  });

  test("delete the new Sector", async ({ page }) => {
    await page.getByRole("link", { name: "Sectors" }).click();
    await expect(page.getByRole("heading", { name: "Sectors" })).toBeVisible();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST SECTOR 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST SECTOR 2")).not.toBeVisible();
  });

  test("clean up test data", async ({ page }) => {
    await cleanupTestData(page);
  });
});
