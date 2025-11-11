// tests/setup/auth.setup.js
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../poms/LoginPage';

const CASHIER_USER = {
  email: 'cajero@racom.com',
  password: 'password123',
};

const authFile = 'playwright/.auth/user.json';

setup('authenticate as cashier', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(CASHIER_USER.email, CASHIER_USER.password);

  // Wait for the main page to load completely.
  await expect(page).toHaveURL(/\/pos\/\d+/);
  await expect(page.getByPlaceholder('Buscar producto...')).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
