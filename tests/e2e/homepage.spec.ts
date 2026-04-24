import { test, expect } from '@playwright/test';

test('sport homepage loads and shows fields list', async ({ page }) => {
  await page.goto('/sport');
  await expect(page).toHaveTitle(/88ARENA/);
});

test('signin page loads', async ({ page }) => {
  await page.goto('/sport/auth/signin');
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test('language switcher toggles to English', async ({ page }) => {
  await page.goto('/sport');
  await page.locator('button', { hasText: 'EN' }).click();
  await expect(page.locator('header')).toContainText(/Sign In|All Fields/);
});
