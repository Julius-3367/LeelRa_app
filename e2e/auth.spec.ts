import { test, expect } from "@playwright/test";

const MEMBER_EMAIL = "member@leelra.ke";
const MEMBER_PASS = "Member@2026";
const ADMIN_EMAIL = "admin@leelra.ke";
const ADMIN_PASS = "Admin@2026";

test.describe("Authentication", () => {
  test("shows login page at /login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in|log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows error for wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await expect(page.getByText(/invalid|incorrect|not found/i)).toBeVisible({ timeout: 5000 });
  });

  test("logs in successfully as member", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(MEMBER_EMAIL);
    await page.getByLabel(/password/i).fill(MEMBER_PASS);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("redirects authenticated user from /login to dashboard", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(MEMBER_EMAIL);
    await page.getByLabel(/password/i).fill(MEMBER_PASS);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    // Try to go back to login
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("forgot password form renders", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /send|reset/i })).toBeVisible();
  });

  test("forgot password shows confirmation after submit", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByRole("button", { name: /send|reset/i }).click();
    await expect(page.getByText(/check your email|email sent|link sent/i)).toBeVisible({ timeout: 8000 });
  });
});

test.describe("Sign out", () => {
  test("signs out and redirects to login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(MEMBER_EMAIL);
    await page.getByLabel(/password/i).fill(MEMBER_PASS);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    // Click sign out in topbar
    await page.getByRole("button", { name: /user menu|profile/i }).click().catch(async () => {
      // Fallback: look for sign out text directly
      await page.getByText(/sign out|logout/i).first().click();
    });
    await page.waitForURL(/\/login/, { timeout: 8000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
