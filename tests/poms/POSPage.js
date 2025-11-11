// tests/poms/POSPage.js
import { expect } from '@playwright/test';

export class POSPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.productSearchInput = page.getByTestId('product-search-input');
    this.productListContainer = page.getByTestId('product-list-container');
    this.cartItemsContainer = page.getByTestId('cart-items-container');
    this.checkoutButton = page.getByTestId('checkout-button');
    this.paymentModal = page.getByTestId('payment-modal');
    this.cashInput = page.getByTestId('cash-input');
    this.acceptPaymentButton = page.getByTestId('accept-payment-button');
  }

  async addProductToCartById(productId) {
    await this.productListContainer.getByTestId(`product-item-${productId}`).click();
  }

  async searchProduct(searchTerm) {
    await this.productSearchInput.fill(searchTerm);
    // Wait for the debounce and search results to update
    await this.page.waitForTimeout(500); 
  }

  async getCartItem(productId) {
    return this.cartItemsContainer.getByTestId(`cart-item-${productId}`);
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    await expect(this.paymentModal).toBeVisible();
  }

  async completeCashPayment(amount) {
    await this.cashInput.fill(amount.toString());
    await this.acceptPaymentButton.click();
  }
}
