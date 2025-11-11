// src/lib/query-functions.js
// Database query functions for POS reports

import { supabase } from '../config/supabase';

// src/lib/query-functions.js
// Database query functions for POS reports

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan credenciales de Supabase. Por favor, define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get sales data for a specific category within a date range
 * @param {string} category - The product category to query
 * @param {object} dateRange - Object with startDate and endDate
 * @returns {object} - Sales report data
 */
async function getSalesForCategory(category, dateRange) {
  try {
    // First, get category ID based on category name
    let categoryQuery = supabase
      .from('categories')
      .select('id, name');

    if (category) {
      categoryQuery = categoryQuery.ilike('name', `%${category}%`);
    }

    const { data: categories, error: categoryError } = await categoryQuery;

    if (categoryError) {
      console.error('Error getting category:', categoryError);
      throw new Error('Error getting category data');
    }

    // Get products in the specified category
    let productIds = [];
    if (categories.length > 0) {
      const categoryIds = categories.map(cat => cat.id);
      
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id')
        .in('category_id', categoryIds);

      if (productError) {
        console.error('Error getting products:', productError);
        throw new Error('Error getting product data');
      }

      productIds = products.map(p => p.id);
    }

    // Get all sales in the date range
    let salesQuery = supabase
      .from('sales')
      .select('cart, total, date')
      .gte('date', dateRange.startDate)
      .lte('date', dateRange.endDate);

    const { data: sales, error: salesError } = await salesQuery;

    if (salesError) {
      console.error('Error getting sales:', salesError);
      throw new Error('Error getting sales data');
    }

    // Process sales data by category
    let totalSales = 0;
    let transactionCount = 0;
    let itemsSold = 0;

    if (productIds.length > 0) {
      // If we're filtering by category
      for (const sale of sales) {
        if (sale.cart && Array.isArray(sale.cart)) {
          for (const item of sale.cart) {
            // Check if this item's product ID is in our category
            if (productIds.includes(item.productId)) {
              totalSales += (item.price || 0) * (item.quantity || 1);
              itemsSold += (item.quantity || 1);
              // Count transaction once per sale that has items in the category
              if (item === sale.cart[0]) {
                transactionCount++;
              }
            }
          }
        }
      }
    } else {
      // If no category filter (category was not found or not specified)
      // Just sum all sales in the date range
      for (const sale of sales) {
        totalSales += sale.total || 0;
        transactionCount++;
        if (sale.cart && Array.isArray(sale.cart)) {
          itemsSold += sale.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        }
      }
    }

    return {
      totalSales,
      transactionCount,
      itemsSold,
      dateRange,
      category
    };
  } catch (error) {
    console.error('Error in getSalesForCategory:', error);
    throw error;
  }
}

/**
 * Get inventory report for a specific category
 * @param {string} category - The product category to query
 * @param {string} location - Optional location filter
 * @returns {object} - Inventory report data
 */
async function getInventoryReport(category, location) {
  try {
    // Get category ID based on category name
    let categoryQuery = supabase
      .from('categories')
      .select('id, name');

    if (category) {
      categoryQuery = categoryQuery.ilike('name', `%${category}%`);
    }

    const { data: categories, error: categoryError } = await categoryQuery;

    if (categoryError) {
      console.error('Error getting category:', categoryError);
      throw new Error('Error getting category data');
    }

    // Get products in the specified category
    let productQuery = supabase
      .from('products')
      .select('id, name, unit');

    if (categories.length > 0) {
      const categoryIds = categories.map(cat => cat.id);
      productQuery = productQuery.in('category_id', categoryIds);
    }

    const { data: products, error: productError } = await productQuery;

    if (productError) {
      console.error('Error getting products:', productError);
      throw new Error('Error getting product data');
    }

    // Get inventory for these products
    let inventoryQuery = supabase
      .from('inventory_batches')
      .select('product_id, quantity, location_id')
      .in('product_id', products.map(p => p.id));

    if (location) {
      inventoryQuery = inventoryQuery.eq('location_id', location);
    }

    const { data: inventoryBatches, error: inventoryError } = await inventoryQuery;

    if (inventoryError) {
      console.error('Error getting inventory:', inventoryError);
      throw new Error('Error getting inventory data');
    }

    // Aggregate inventory by product
    const productInventory = {};
    products.forEach(product => {
      productInventory[product.id] = {
        ...product,
        totalQuantity: 0
      };
    });

    inventoryBatches.forEach(batch => {
      if (productInventory[batch.product_id]) {
        productInventory[batch.product_id].totalQuantity += batch.quantity || 0;
      }
    });

    // Filter out products with no inventory
    const inventoryList = Object.values(productInventory).filter(item => item.totalQuantity > 0);

    return {
      inventoryList,
      category,
      location: location || 'all',
      totalProducts: inventoryList.length
    };
  } catch (error) {
    console.error('Error in getInventoryReport:', error);
    throw error;
  }
}

/**
 * Get sales comparison between two periods
 * @param {string} category - Optional product category to filter
 * @param {object} currentPeriod - Object with startDate and endDate for current period
 * @param {object} previousPeriod - Object with startDate and endDate for previous period
 * @returns {object} - Sales comparison data
 */
async function getSalesComparison(category, currentPeriod, previousPeriod) {
  try {
    // Helper function to get total sales for a period
    const getPeriodSales = async (period) => {
      let salesQuery = supabase
        .from('sales')
        .select('cart, total, date')
        .gte('date', period.startDate)
        .lte('date', period.endDate);

      const { data: sales, error: salesError } = await salesQuery;

      if (salesError) {
        console.error('Error getting sales:', salesError);
        throw new Error('Error getting sales data');
      }

      // If category is specified, we need to filter by product category
      if (category) {
        let categoryQuery = supabase
          .from('categories')
          .select('id, name')
          .ilike('name', `%${category}%`);

        const { data: categories, error: categoryError } = await categoryQuery;

        if (categoryError) {
          console.error('Error getting category:', categoryError);
          throw new Error('Error getting category data');
        }

        // Get products in the specified category
        let productIds = [];
        if (categories.length > 0) {
          const categoryIds = categories.map(cat => cat.id);
          
          const { data: products, error: productError } = await supabase
            .from('products')
            .select('id')
            .in('category_id', categoryIds);

          if (productError) {
            console.error('Error getting products:', productError);
            throw new Error('Error getting product data');
          }

          productIds = products.map(p => p.id);
        }

        // Calculate sales only for products in the specified category
        let categorySales = 0;
        for (const sale of sales) {
          if (sale.cart && Array.isArray(sale.cart)) {
            for (const item of sale.cart) {
              // Check if this item's product ID is in our category
              if (productIds.includes(item.productId)) {
                categorySales += (item.price || 0) * (item.quantity || 1);
              }
            }
          }
        }
        return categorySales;
      }

      // If no category filter, sum all sales totals
      return sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    };

    const currentPeriodSales = await getPeriodSales(currentPeriod);
    const previousPeriodSales = await getPeriodSales(previousPeriod);

    // Calculate percentage change
    const changePercent = previousPeriodSales !== 0 
      ? ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100
      : currentPeriodSales > 0 ? 100 : 0;

    return {
      currentPeriod: currentPeriodSales,
      previousPeriod: previousPeriodSales,
      changePercent,
      category: category || 'all',
      periods: {
        current: currentPeriod,
        previous: previousPeriod
      }
    };
  } catch (error) {
    console.error('Error in getSalesComparison:', error);
    throw error;
  }
}

module.exports = {
  getSalesForCategory,
  getInventoryReport,
  getSalesComparison
};