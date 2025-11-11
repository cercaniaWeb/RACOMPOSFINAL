import { test, expect } from '@playwright/test';
import { POSPage } from './poms/POSPage';

test.describe('POS Flow', () => {
  let posPage;

  test.beforeEach(async ({ page }) => {
    posPage = new POSPage(page);
    // The user is already logged in as a cashier due to global setup.
    // Navigate to the POS page directly.
    await page.goto('/pos/1'); // Assuming storeId 1
    await expect(page.getByPlaceholder('Buscar producto...')).toBeVisible();
  });

  test('should allow a cashier to add a product to cart and complete a cash payment', async ({ page }) => {
    // Assuming a product with ID '1' exists and is visible.
    // In a real scenario, you might create a product via API before the test.
    const productId = '1'; // Placeholder product ID
    const productName = 'Producto de Prueba'; // Placeholder product name
    const productPrice = 100; // Placeholder product price

    // 1. Search for a product (optional, if product is already visible)
    await posPage.searchProduct(productName);

    // 2. Add the product to the cart
    await posPage.addProductToCartById(productId);

    // 3. Verify the product is in the cart
    const cartItem = posPage.getCartItem(productId);
    await expect(cartItem).toBeVisible();
    await expect(cartItem).toContainText(productName);
    await expect(cartItem).toContainText(productPrice.toLocaleString());

    // 4. Proceed to checkout
    await posPage.proceedToCheckout();

    // 5. Complete the payment with cash
    // Assuming the total is the product price for a single item.
    await posPage.completeCashPayment(productPrice);

    // 6. Verify the sale is complete (cart is empty, post-payment modal appears)
    await expect(posPage.cartItemsContainer).not.toContainText(productName); // Cart should be empty
    await expect(page.getByText('Opciones de Ticket')).toBeVisible(); // Post-payment modal
  });
});
