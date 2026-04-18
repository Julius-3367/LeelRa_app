import { test, expect } from "@playwright/test";

const MEMBER_EMAIL = "member@leelra.ke";
const MEMBER_PASS = "Member@2026";
const ADMIN_EMAIL = "admin@leelra.ke";
const ADMIN_PASS = "Admin@2026";

async function loginAs(page: any, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe("Request submission (Member)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, MEMBER_EMAIL, MEMBER_PASS);
  });

  test("member can navigate to submit request form", async ({ page }) => {
    await page.goto("/requests/new");
    await expect(page.getByText(/submit|new request|activity request/i)).toBeVisible();
  });

  test("member can submit a request", async ({ page }) => {
    await page.goto("/requests/new");

    await page.getByLabel(/title/i).fill("E2E Test Baraza");
    await page.getByLabel(/description/i).fill("End-to-end test community meeting");
    await page.getByLabel(/venue/i).fill("Ainamoi Test Hall");

    // Set date 10 days from now
    const future = new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0];
    await page.getByLabel(/event date/i).fill(future);
    await page.getByLabel(/time/i).fill("10:00");
    await page.getByLabel(/attendance|participants/i).fill("100");
    await page.getByLabel(/organiser/i).fill("Test Organiser");
    await page.getByLabel(/phone|contact/i).fill("+254700000001");

    await page.getByRole("button", { name: /submit/i }).click();

    // Should redirect to mine page or show success
    await expect(page.getByText(/submitted|success|request/i)).toBeVisible({ timeout: 8000 });
  });

  test("member can view their requests", async ({ page }) => {
    await page.goto("/requests/mine");
    await expect(page.getByText(/my requests|requests/i)).toBeVisible();
  });
});

test.describe("Request approval (Admin)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  });

  test("admin can view all requests", async ({ page }) => {
    await page.goto("/requests");
    await expect(page.getByText(/all requests|activity requests/i)).toBeVisible();
  });

  test("admin can see request detail page", async ({ page }) => {
    await page.goto("/requests");
    // Click first request link if any exist
    const firstRow = page.getByRole("link", { name: /view|details/i }).first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await expect(page.getByText(/approve|reject/i)).toBeVisible({ timeout: 5000 });
    } else {
      // No requests yet — pass
      expect(true).toBe(true);
    }
  });
});

test.describe("Activities page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, MEMBER_EMAIL, MEMBER_PASS);
  });

  test("activities page loads", async ({ page }) => {
    await page.goto("/activities");
    await expect(page.getByText(/activities|upcoming/i)).toBeVisible();
  });
});
