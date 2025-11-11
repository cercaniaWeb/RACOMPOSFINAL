import { test, expect } from '@playwright/test';

test.describe('Notification System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page where notifications can be triggered.
    // For this example, let's assume there's a simple page at '/'
    // that has buttons to trigger notifications.
    // You might need to adjust this URL based on your application's routing.
    await page.goto('/');
  });

  test('should display and auto-dismiss a success notification', async ({ page }) => {
    // Assuming there's a button with text "Show Success" that triggers a success notification
    await page.click('button:has-text("Show Success")');

    const successNotification = page.locator('div[role="alert"].bg-green-500');
    await expect(successNotification).toBeVisible();
    await expect(successNotification).toContainText('Success message!');

    // Wait for the notification to auto-dismiss (default 5000ms)
    await expect(successNotification).not.toBeVisible({ timeout: 6000 });
  });

  test('should display and manually dismiss an error notification', async ({ page }) => {
    // Assuming there's a button with text "Show Error" that triggers an error notification
    await page.click('button:has-text("Show Error")');

    const errorNotification = page.locator('div[role="alert"].bg-red-500');
    await expect(errorNotification).toBeVisible();
    await expect(errorNotification).toContainText('Error message!');

    // Click the dismiss button
    await page.click('button[aria-label="Dismiss notification"]');

    await expect(errorNotification).not.toBeVisible();
  });

  test('should display multiple notifications simultaneously', async ({ page }) => {
    await page.click('button:has-text("Show Info")');
    await page.click('button:has-text("Show Warning")');

    const infoNotification = page.locator('div[role="alert"].bg-blue-500');
    const warningNotification = page.locator('div[role="alert"].bg-yellow-400');

    await expect(infoNotification).toBeVisible();
    await expect(warningNotification).toBeVisible();
    await expect(infoNotification).toContainText('Info message!');
    await expect(warningNotification).toContainText('Warning message!');

    // Wait for them to auto-dismiss
    await expect(infoNotification).not.toBeVisible({ timeout: 6000 });
    await expect(warningNotification).not.toBeVisible({ timeout: 6000 });
  });
});
