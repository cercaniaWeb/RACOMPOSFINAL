// tests/poms/InventoryPage.js
import { expect } from '@playwright/test';

export class InventoryPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.addProductButton = page.getByTestId('add-product-button');
    this.productSearchInput = page.getByTestId('product-search-input');
    this.productTableBody = page.getByTestId('product-table-body');
    this.productNameInput = page.getByTestId('product-name-input');
    this.productPriceInput = page.getByTestId('product-price-input');
    this.productCostInput = page.getByTestId('product-cost-input');
    this.productBarcodeInput = page.getByTestId('product-barcode-input');
    this.productCategorySelect = page.getByTestId('product-category-select');
    this.submitProductFormButton = page.getByTestId('submit-product-form-button');
    this.cancelProductFormButton = page.getByTestId('cancel-product-form-button');
  }

  async goto() {
    await this.page.goto('/inventory');
    await expect(this.addProductButton).toBeVisible();
  }

  async addProduct(productData) {
    await this.addProductButton.click();
    await expect(this.productNameInput).toBeVisible(); // Ensure modal is open

    await this.productNameInput.fill(productData.name);
    await this.productPriceInput.fill(productData.price.toString());
    await this.productCostInput.fill(productData.cost.toString());
    await this.productBarcodeInput.fill(productData.barcode);
    await this.productCategorySelect.selectOption({ value: productData.categoryId });

    // Fill inventory details for the first store (assuming at least one store exists)
    // We need to find the store ID dynamically or ensure it's passed correctly.
    // For now, assuming productData.storeId is the actual ID.
    const firstStoreInventoryQuantityInput = this.page.getByTestId(`inventory-quantity-input-${productData.storeId}`);
    await firstStoreInventoryQuantityInput.fill(productData.quantity.toString());

    await this.submitProductFormButton.click();

    // Wait for the product to appear in the list and extract its ID
    // This assumes the product name is unique enough to find the row.
    const productRow = this.page.locator(`[data-testid^="product-row-"]:has-text("${productData.name}")`);
    await expect(productRow).toBeVisible();
    const productId = await productRow.getAttribute('data-testid');
    return productId.replace('product-row-', '');
  }

  async editProduct(productId, updatedData) {
    await this.page.getByTestId(`edit-product-button-${productId}`).click();
    await expect(this.productNameInput).toBeVisible(); // Ensure modal is open

    if (updatedData.name) await this.productNameInput.fill(updatedData.name);
    if (updatedData.price) await this.productPriceInput.fill(updatedData.price.toString());
    // Add more fields as needed

    await this.submitProductFormButton.click();
  }

  async deleteProduct(productId) {
    await this.page.getByTestId(`delete-product-button-${productId}`).click();
    // Handle confirmation dialog if any
    this.page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('¿Estás seguro de que deseas eliminar este producto?');
      await dialog.accept();
    });
  }

  async searchProduct(searchTerm) {
    await this.productSearchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Debounce
  }

  async getProductRow(productId) {
    return this.productTableBody.getByTestId(`product-row-${productId}`);
  }
}
