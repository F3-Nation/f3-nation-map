import { expect, test } from "@playwright/test";

import { goToAdminPortal, setupAdminTestEnvironment } from "./helpers";

test.describe("Admin Portal", () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminTestEnvironment(page);
    await goToAdminPortal(page);
  });

  test("go to Sectors and add a new Sector", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "Sectors" }).click();
    await page.getByRole("button", { name: "Add Sector" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST SECTOR");
    await page.getByRole("combobox").filter({ hasText: /^$/ }).click();
    await page.getByRole("option", { name: "F3 Nation" }).click();

    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("edit the new Sector", async ({ page }) => {
    await page.getByRole("link", { name: "Sectors" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST SECTOR")).toBeVisible();
    await page.getByText("SUPER TEST SECTOR").first().click();
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST SECTOR 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("go to Areas and add a new Area", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "Areas" }).click();
    await page.getByRole("button", { name: "Add Area" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST AREA");
    await page.getByRole("combobox").filter({ hasText: /^$/ }).click();
    await page.getByRole("option", { name: "SUPER TEST SECTOR" }).click();

    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("edit the new Area", async ({ page }) => {
    await page.getByRole("link", { name: "Areas" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await expect(page.getByText("SUPER TEST AREA")).toBeVisible();
    await page.getByText("SUPER TEST AREA").click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST AREA 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("go to Regions and add a new Region", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "Regions" }).click();
    await page.getByRole("button", { name: "Add Region" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST REGION");
    await page.getByRole("combobox").filter({ hasText: /^$/ }).click();
    await page.getByRole("option", { name: "Boone" }).click();

    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
  });

  test("edit the new Region", async ({ page }) => {
    await page.getByRole("link", { name: "Regions" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST REGION").click();
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST REGION 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("go to AOs and add a new AO", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "AOs" }).click();
    await page.getByRole("button", { name: "Add AO" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST AO");
    await page.getByRole("combobox").filter({ hasText: /^$/ }).click();
    await page.getByPlaceholder("Select a region").fill("super");
    await page.getByRole("option", { name: "SUPER TEST REGION 2" }).click();

    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Active", exact: true }).click();
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
  });

  test("edit the new AO", async ({ page }) => {
    await page.getByRole("link", { name: "AOs" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST AO").click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST AO 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("go to Event Types and add a new Event Type", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "Event Types" }).click();
    await page.getByRole("button", { name: "Add Event Type" }).click();
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST EVENT TYPE");
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("Test event type description");
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Active", exact: true }).click();

    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
  });

  test("edit the new Event Type", async ({ page }) => {
    await page.getByRole("link", { name: "Event Types" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST EVENT TYPE").click();
    await page
      .getByRole("textbox", { name: "Name" })
      .fill("SUPER TEST EVENT TYPE 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("go to Events and add a new Event", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await page.getByRole("link", { name: "Events" }).click();
    await page.getByRole("button", { name: "Add Event" }).click();

    // Select the AO
    await page.getByLabel("AO").click();
    await page.getByPlaceholder("Select an AO").fill("super");
    await page.getByRole("option", { name: "SUPER TEST AO 2" }).click();

    // Select Event Type
    await page.getByLabel("Event Type").click();
    await page.getByPlaceholder("Select an event type").fill("super");
    await page.getByRole("option", { name: "SUPER TEST EVENT TYPE 2" }).click();

    // Fill in other details
    await page.getByLabel("Title").fill("SUPER TEST EVENT");
    await page.getByLabel("Description").fill("This is a test event");

    // Set date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0] ?? "";

    await page.getByLabel("Date").fill(dateString);
    await page.getByLabel("Time").fill("06:00");

    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
  });

  test("edit the new Event", async ({ page }) => {
    await page.getByRole("link", { name: "Events" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST EVENT").click();
    await page.getByLabel("Title").fill("SUPER TEST EVENT 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  // Delete all test items in reverse order
  test("delete the Event", async ({ page }) => {
    await page.getByRole("link", { name: "Events" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST EVENT 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
  });

  test("delete the Event Type", async ({ page }) => {
    await page.getByRole("link", { name: "Event Types" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST EVENT TYPE 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
  });

  test("delete the new AO", async ({ page }) => {
    await page.getByRole("link", { name: "AOs" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST AO 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
  });

  test("delete the new Region", async ({ page }) => {
    await page.getByRole("link", { name: "Regions" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST REGION 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
  });

  test("delete the new Area", async ({ page }) => {
    await page.getByRole("link", { name: "Areas" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST AREA 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
  });

  test("delete the new Sector", async ({ page }) => {
    await page.getByRole("link", { name: "Sectors" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
    await page.getByText("SUPER TEST SECTOR 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
  });
});
