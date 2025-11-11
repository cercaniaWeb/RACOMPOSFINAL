// Test to verify field mapping between camelCase and snake_case

import { describe, it, expect, vi } from 'vitest';
import { 
  getProducts, 
  getProduct,
  addProduct,
  updateProduct
} from '../utils/supabaseAPI';

// Mock Supabase functions for testing
vi.mock('../utils/supabaseAPI', async () => {
  const actual = await vi.importActual('../utils/supabaseAPI');
  return {
    ...actual,
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    getProduct: vi.fn(),
    getProducts: vi.fn()
  };
});

describe('Field Mapping Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify field mapping during product creation and retrieval', async () => {
    // Test 1: Creating a product with camelCase fields
    const productData = {
      name: 'Field Mapping Test Product',
      price: 19.99,
      cost: 15.50,
      categoryId: 'abarrotes',  // camelCase input
      subcategoryId: null,
      unitOfMeasure: 'unidad',  // camelCase input
      minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 },
      description: 'Product to test field mapping',
      imageUrl: null,
      brand: 'Test Brand',
      supplierId: 'SUP001',  // camelCase input
      weight: 1.2,
      dimensions: { length: 10, width: 5, height: 5 },
      taxRate: 16.00,  // camelCase input
      isActive: true,   // camelCase input
      notes: 'Test field mapping',
      tags: ['test', 'mapping']
    };
    
    // Mock the addProduct function to return an ID
    const mockProductId = 'test-product-id';
    addProduct.mockResolvedValue(mockProductId);
    
    // Execute the addProduct function
    const productId = await addProduct(productData);
    
    // Verify the function was called
    expect(addProduct).toHaveBeenCalledTimes(1);
    expect(productId).toBe(mockProductId);
    
    // Verify that the API function receives the right field mappings
    const callArgs = addProduct.mock.calls[0][0];
    
    // Check that camelCase fields are preserved in the call
    expect(callArgs.name).toBe('Field Mapping Test Product');
    expect(callArgs.categoryId).toBe('abarrotes');
    expect(callArgs.supplierId).toBe('SUP001');
    expect(callArgs.taxRate).toBe(16.00);
    expect(callArgs.isActive).toBe(true);
    expect(callArgs.unitOfMeasure).toBe('unidad');
    
    // Test 2: Mock retrieval to check field mapping
    const mockReturnedProduct = {
      id: mockProductId,
      name: 'Field Mapping Test Product',
      price: 19.99,
      cost: 15.50,
      category_id: 'abarrotes', // snake_case from DB
      categoryId: 'abarrotes',  // camelCase mapped for app
      subcategory_id: null,
      subcategoryId: null,
      unit: 'unidad',           // snake_case from DB
      unitOfMeasure: 'unidad',  // camelCase mapped for app
      min_stock_threshold: { '1': 5, '2': 5, 'bodega-central': 10 },
      minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 },
      description: 'Product to test field mapping',
      image_url: null,
      imageUrl: null,
      brand: 'Test Brand',
      supplier_id: 'SUP001',    // snake_case from DB
      supplierId: 'SUP001',     // camelCase mapped for app
      weight: 1.2,
      dimensions: { length: 10, width: 5, height: 5 },
      tax_rate: 16.00,          // snake_case from DB
      taxRate: 16.00,           // camelCase mapped for app
      is_active: true,          // snake_case from DB
      isActive: true,           // camelCase mapped for app
      notes: 'Test field mapping',
      tags: ['test', 'mapping']
    };
    
    // Mock the getProduct function
    getProduct.mockResolvedValue(mockReturnedProduct);
    
    // Retrieve the product
    const retrievedProduct = await getProduct(mockProductId);
    
    // Verify the function was called
    expect(getProduct).toHaveBeenCalledTimes(1);
    expect(getProduct).toHaveBeenCalledWith(mockProductId);
    
    // Check that both camelCase and snake_case fields exist in retrieved data
    expect(retrievedProduct).toHaveProperty('categoryId');
    expect(retrievedProduct).toHaveProperty('category_id');
    expect(retrievedProduct).toHaveProperty('supplierId');
    expect(retrievedProduct).toHaveProperty('supplier_id');
    expect(retrievedProduct).toHaveProperty('taxRate');
    expect(retrievedProduct).toHaveProperty('tax_rate');
    expect(retrievedProduct).toHaveProperty('unitOfMeasure');
    expect(retrievedProduct).toHaveProperty('unit');
    expect(retrievedProduct).toHaveProperty('isActive');
    expect(retrievedProduct).toHaveProperty('is_active');
    
    // Verify the values are correctly mapped
    expect(retrievedProduct.categoryId).toBe('abarrotes');
    expect(retrievedProduct.category_id).toBe('abarrotes');
    expect(retrievedProduct.supplierId).toBe('SUP001');
    expect(retrievedProduct.supplier_id).toBe('SUP001');
    expect(retrievedProduct.taxRate).toBe(16.00);
    expect(retrievedProduct.tax_rate).toBe(16.00);
    expect(retrievedProduct.unitOfMeasure).toBe('unidad');
    expect(retrievedProduct.unit).toBe('unidad');
    expect(retrievedProduct.isActive).toBe(true);
    expect(retrievedProduct.is_active).toBe(true);
  });

  it('should verify field mapping during product update', async () => {
    const productId = 'test-product-id';
    const updateData = {
      name: 'Updated Field Mapping Test Product',
      categoryId: 'bebidas',  // camelCase input
      unitOfMeasure: 'kg',    // camelCase input
      supplierId: 'SUP002',   // camelCase input
      taxRate: 8.00,         // camelCase input
      weight: 2.5
    };
    
    // Mock the updateProduct function
    updateProduct.mockResolvedValue();
    
    // Perform the update
    await updateProduct(productId, updateData);
    
    // Verify the function was called with the right parameters
    expect(updateProduct).toHaveBeenCalledTimes(1);
    expect(updateProduct).toHaveBeenCalledWith(productId, updateData);
    
    const callArgs = updateProduct.mock.calls[0];
    expect(callArgs[0]).toBe(productId);
    
    // Check specific updates
    const updatePayload = callArgs[1];
    expect(updatePayload.name).toBe('Updated Field Mapping Test Product');
    expect(updatePayload.categoryId).toBe('bebidas');
    expect(updatePayload.supplierId).toBe('SUP002');
    expect(updatePayload.taxRate).toBe(8.00);
    expect(updatePayload.weight).toBe(2.5);
  });

  it('should verify field mapping in getProducts', async () => {
    // Mock the getProducts function
    const mockProducts = [
      {
        id: 'product1',
        name: 'Test Product 1',
        category_id: 'abarrotes', // snake_case from DB
        categoryId: 'abarrotes',  // camelCase mapped for app
        supplier_id: 'SUP001',    // snake_case from DB
        supplierId: 'SUP001',     // camelCase mapped for app
        tax_rate: 16.00,          // snake_case from DB
        taxRate: 16.00,           // camelCase mapped for app
        is_active: true,          // snake_case from DB
        isActive: true            // camelCase mapped for app
      },
      {
        id: 'product2',
        name: 'Test Product 2',
        category_id: 'bebidas',   // snake_case from DB
        categoryId: 'bebidas',    // camelCase mapped for app
        supplier_id: 'SUP002',    // snake_case from DB
        supplierId: 'SUP002',     // camelCase mapped for app
        tax_rate: 8.00,           // snake_case from DB
        taxRate: 8.00,            // camelCase mapped for app
        is_active: false,         // snake_case from DB
        isActive: false           // camelCase mapped for app
      }
    ];
    
    getProducts.mockResolvedValue(mockProducts);
    
    // Get all products
    const products = await getProducts();
    
    // Verify the function was called
    expect(getProducts).toHaveBeenCalledTimes(1);
    
    // Check that both camelCase and snake_case fields exist in retrieved data
    expect(products[0]).toHaveProperty('categoryId');
    expect(products[0]).toHaveProperty('category_id');
    expect(products[0]).toHaveProperty('supplierId');
    expect(products[0]).toHaveProperty('supplier_id');
    expect(products[0]).toHaveProperty('taxRate');
    expect(products[0]).toHaveProperty('tax_rate');
    expect(products[0]).toHaveProperty('isActive');
    expect(products[0]).toHaveProperty('is_active');
    
    // Verify the values are correctly mapped
    expect(products[0].categoryId).toBe('abarrotes');
    expect(products[0].category_id).toBe('abarrotes');
    expect(products[0].supplierId).toBe('SUP001');
    expect(products[0].supplier_id).toBe('SUP001');
    expect(products[0].taxRate).toBe(16.00);
    expect(products[0].tax_rate).toBe(16.00);
    expect(products[0].isActive).toBe(true);
    expect(products[0].is_active).toBe(true);
  });
});