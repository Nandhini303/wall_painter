import { test, expect } from '@playwright/test';

test.describe('Smart Wall Paint Visualizer E2E Test Suite', () => {
  test('should render login page correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/LuminaPaint|Angular/i);
    await expect(page.locator('h2')).toContainText(/Welcome Back|Login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should allow navigation to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[routerLink="/register"]');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h2')).toContainText(/Create Account|Register/i);
  });

  test('should protect dashboard route when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Guard redirects unauthenticated visitors to login
    await expect(page).toHaveURL('/login');
  });
});
