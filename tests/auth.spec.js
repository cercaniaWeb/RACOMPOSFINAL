import { test, expect } from '@playwright/test';
import { LoginPage } from './poms/LoginPage';

// IMPORTANT: These tests assume that the following users exist in your test database.
// Please ensure your Supabase test environment is seeded with this data.
const ADMIN_USER = {
  email: 'useradmintest@pos.com',
  password: 'test123',
};

const CASHIER_USER = {
  email: 'usercajatest@pos.com',
  password: 'test123',
};

const INVALID_USER = {
  email: 'invalid@example.com',
  password: 'wrongpassword',
};

test.describe('Authentication Flows', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should allow an admin to log in successfully and redirect to admin dashboard', async ({ page }) => {
    await loginPage.login(ADMIN_USER.email, ADMIN_USER.password);

    // After a successful login, the user should be redirected to the admin dashboard.
    await expect(page).toHaveURL('/admin');
    // A welcome message or a dashboard title should be visible.
    await expect(page.getByRole('heading', { name: 'Panel de Administración' })).toBeVisible();
  });

  test('should allow a cashier to log in successfully and redirect to POS page', async ({ page }) => {
    await loginPage.login(CASHIER_USER.email, CASHIER_USER.password);

    // Cashiers are redirected to the POS page for their assigned store.
    await expect(page).toHaveURL(/\/pos\/\d+/); // Matches /pos/1, /pos/2, etc.
    // The main POS interface should be visible.
    await expect(page.getByPlaceholder('Buscar producto...')).toBeVisible();
  });

  test('should show an error message for invalid credentials', async () => {
    await loginPage.login(INVALID_USER.email, INVALID_USER.password);

    // An error message should be displayed on the login page.
    await loginPage.assertErrorMessage('Usuario o contraseña incorrectos');
  });

  test('should allow a logged-in user to log out', async ({ page }) => {
    // First, log in as any user.
    await loginPage.login(CASHIER_USER.email, CASHIER_USER.password);
    await expect(page).toHaveURL(/\/pos\/\d+/);

    // Click the user menu button to open the dropdown.
    await page.getByTestId('user-menu-button').click();

    // Click the logout button from the dropdown.
    await page.getByTestId('logout-button').click();

    // After logging out, the user should be redirected to the login page.
    await expect(page).toHaveURL('/login');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
