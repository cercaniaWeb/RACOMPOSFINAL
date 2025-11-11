import { test, expect } from '@playwright/test';
import { InventoryPage } from './poms/InventoryPage';

test.describe('Inventory Management Flow', () => {
  let inventoryPage;
  const newProductId = 'test-product-123'; // Placeholder for a dynamically generated ID or a known ID
  const newProductName = `Test Product ${Date.now()}`;
  const updatedProductName = `Updated Test Product ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    // The user is already logged in as an admin due to global setup.
    await inventoryPage.goto();
  });

  test('should allow an admin to add, edit, and delete a product', async ({ page }) => {
    // Assuming a default category and store exist for product creation
    // In a real scenario, these would be created via API or seeded.
    const defaultCategoryId = '1'; // Placeholder: Replace with an actual category ID from your DB
    const defaultStoreId = '1'; // Placeholder: Replace with an actual store ID from your DB

    // 1. Add a new product
    const addedProductId = await inventoryPage.addProduct({
      name: newProductName,
      price: 10.50,
      cost: 5.00,
      barcode: `BARCODE-${Date.now()}`,
      categoryId: defaultCategoryId,
      storeId: defaultStoreId,
      quantity: 100,
    });

    // Verify the product appears in the list
    await inventoryPage.searchProduct(newProductName);
    await expect(inventoryPage.getProductRow(addedProductId)).toBeVisible();

    // 2. Edit the product
    await inventoryPage.editProduct(addedProductId, { name: updatedProductName });

    // Verify the product changes are reflected
    await inventoryPage.searchProduct(updatedProductName);
    await expect(inventoryPage.getProductRow(addedProductId)).toBeVisible();
    await expect(inventoryPage.getProductRow(addedProductId)).toContainText(updatedProductName);

    // 3. Delete the product
    await inventoryPage.deleteProduct(addedProductId);

    // Verify the product is removed from the list
    await inventoryPage.searchProduct(updatedProductName);
    await expect(inventoryPage.getProductRow(addedProductId)).not.toBeVisible();
  });
});
