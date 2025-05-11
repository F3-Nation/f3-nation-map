import { expect, test } from "@playwright/test";

import { setupAdminTestEnvironment } from "./helpers";

test.describe("Admin Portal", () => {
  test("go to admin portal", async ({ page }) => {
    await setupAdminTestEnvironment(page);
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: "Admin Portal" }).click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test("go to AOs and add a new AO", async ({ page }) => {
    await page.getByRole("link", { name: "AOs" }).click();
    await page.getByRole("button", { name: "Add AO" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST");
    await page.getByRole("combobox").filter({ hasText: /^$/ }).click();
    await page.getByPlaceholder("Select a region").fill("boon");
    await page.getByText("Boone").click();

    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Active", exact: true }).click();
    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).click();
    await page.getByRole("textbox", { name: "Search rows..." }).fill("super");
  });

  test("edit the new AO", async ({ page }) => {
    await page.getByText("SUPER TEST").click();
    await page.getByRole("textbox", { name: "Name" }).fill("SUPER TEST 2");
    await page.getByRole("button", { name: "Save Changes" }).click();
  });

  test("delete the new AO", async ({ page }) => {
    await page.getByText("SUPER TEST 2").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
  });
  // await page.getByText('SUPER TEST').click();
  // await page.locator('div').filter({ hasText: 'Edit' }).first().click();
  // await page.getByRole('button', { name: 'Close' }).click();
  // await page.getByRole('link', { name: 'Regions' }).click();
  // await page.getByRole('button', { name: 'Add Region' }).click();
  // await page.getByRole('textbox', { name: 'Name' }).fill('SUPER TEST 3');
  // await page.getByRole('combobox').filter({ hasText: /^$/ }).click();
  // await page.getByRole('option', { name: 'Arklahoma' }).click();
  // await page.getByRole('button', { name: 'Save Changes' }).click();
  // await page.getByRole('textbox', { name: 'Search rows...' }).click();
  // await page.getByRole('textbox', { name: 'Search rows...' }).fill('super ');
  // await page.getByText('Arklahoma').click();
  // await page.getByRole('textbox', { name: 'Name' }).fill('SUPER TEST 4');
  // await page.getByRole('button', { name: 'Save Changes' }).click();
});
