import { describe, it, expect } from 'vitest';
import useAppStore from '../store/useAppStore';
import { 
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getInventoryBatches,
  addInventoryBatch,
  updateInventoryBatch,
  deleteInventoryBatch
} from '../utils/supabaseAPI.js';

describe('E2E Workflow', () => {
  it('should run the authentication workflow', async () => {
    const { data: users } = await getUsers();
    expect(users).toBeInstanceOf(Array);
  });

  it('should run the product management workflow', async () => {
    const { data: products } = await getProducts();
    expect(products).toBeInstanceOf(Array);

    const productData = {
      name: 'Test Product for E2E',
      price: 15.99,
      cost: 12.50,
      unit: 'unidad',
      brand: 'Test Brand',
      supplier_id: 'SUP001',
      weight: 0.5,
      tax_rate: 16.00,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const productId = await addProduct(productData);
    expect(productId).toBeDefined();

    await updateProduct(productId, { ...productData, name: 'Updated Test Product' });

    await deleteProduct(productId);
  });

  it('should run the inventory management workflow', async () => {
    const { data: inventory } = await getInventoryBatches();
    expect(inventory).toBeInstanceOf(Array);
  });

  it('should run the sales flow', async () => {
    const store = useAppStore.getState();
    await store.loadProducts();
    const { products } = store;
    expect(products).toBeInstanceOf(Array);

    if (products.length > 0) {
      store.addToCart(products[0]);
      const { cart } = useAppStore.getState();
      expect(cart.length).toBe(1);
    }
  });
});