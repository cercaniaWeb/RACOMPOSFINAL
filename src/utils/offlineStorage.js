// Helper function to validate if a key is valid for IndexedDB
function isValidKey(key) {
  // Valid key types in IndexedDB: string, number, Date, Array of valid keys, or ArrayBuffer
  if (key === null || key === undefined) {
    return false;
  }
  
  // Arrays need to have only valid key types as elements
  if (Array.isArray(key)) {
    return key.every(k => isValidKey(k));
  }
  
  // Primitive types that are valid keys
  const type = typeof key;
  return (
    type === 'string' || 
    type === 'number' || 
    type === 'boolean' || // boolean is acceptable
    key instanceof Date || 
    key instanceof ArrayBuffer ||
    // Allow any finite number (including integers)
    (type === 'number' && Number.isFinite(key))
  );
}

// offlineStorage.js - Offline data persistence for POS app

// Initialize IndexedDB for offline data storage
class OfflineStorage {
  constructor() {
    this.dbName = 'POSOfflineDB';
    this.version = 3;  // Incremented version to update schema
    this.db = null;
  }
  
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (e) => {
        console.error('Database failed to open', e);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        const oldVersion = e.oldVersion;
        const newVersion = e.newVersion;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('name', 'name', { unique: false });
          productsStore.createIndex('category', 'category', { unique: false });
        }

        if (db.objectStoreNames.contains('inventory')) {
            db.deleteObjectStore('inventory');
        }
        if (!db.objectStoreNames.contains('inventoryBatches')) {
          const inventoryBatchesStore = db.createObjectStore('inventoryBatches', { keyPath: 'inventoryId' });
          inventoryBatchesStore.createIndex('productId', 'productId', { unique: false });
          inventoryBatchesStore.createIndex('locationId', 'locationId', { unique: false });
        }

        if (!db.objectStoreNames.contains('sales')) {
          const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
          salesStore.createIndex('date', 'date', { unique: false });
          salesStore.createIndex('cashier', 'cashier', { unique: false });
        }

        if (!db.objectStoreNames.contains('categories')) {
          const categoriesStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoriesStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('carts')) {
          const cartsStore = db.createObjectStore('carts', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('stores')) {
          const storesStore = db.createObjectStore('stores', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('clients')) {
          const clientsStore = db.createObjectStore('clients', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('pendingSales')) {
          const pendingSalesStore = db.createObjectStore('pendingSales', { keyPath: 'id' });
        }

        console.log(`Database setup complete, version: ${oldVersion} -> ${newVersion}`);
      };
    });
  }

  async addData(storeName, data) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      
      // For stores with auto-generated keys (like sales), we don't need to provide an id
      // For stores with specific keyPath requirements, we need to ensure the data has the correct key property
      const request = objectStore.add(data);

      request.onsuccess = () => {
        console.log(`${storeName} data added successfully`);
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error(`Error adding ${storeName} data`, event.target.error);
        // Check if it's a key error specifically
        const error = event.target.error;
        if (error && error.name === 'DataError') {
          console.error('DataError: This usually means the object does not have the correct key property for the store');
          console.error('Ensure the data object has the correct key property for the object store');
        }
        reject(error);
      };
    });
  }

  async getData(storeName, key) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      
      // Validate the key before attempting to get
      if (!isValidKey(key)) {
        reject(new Error(`Invalid key provided: ${key}`));
        return;
      }
      
      const request = objectStore.get(key);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error(`Error getting ${storeName} data`, event.target.error);
        reject(event.target.error);
      };
    });
  }

  async updateData(storeName, key, data) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      
      // Create a data object that includes the key as id if the store expects it
      const dataToStore = storeName === 'carts' && key === 'current_cart' 
        ? { ...data, id: key }  // For cart data, store as keyed object
        : storeName === 'inventoryBatches'
        ? { ...data, inventoryId: key || data.inventoryId } // For inventory batches, use inventoryId
        : { ...data, id: key || data.id }; // For other data, use provided key or data's existing id
      
      // Check if store expects a specific key path
      if (objectStore.keyPath) {
        // If store has keyPath, data object should contain the key
        const request = objectStore.put(dataToStore);
        
        request.onsuccess = () => {
          console.log(`${storeName} data updated successfully`);
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error(`Error updating ${storeName} data`, event.target.error);
          reject(event.target.error);
        };
      } else {
        // If store uses out-of-line keys, pass key separately
        const request = objectStore.put(dataToStore, key);
        
        request.onsuccess = () => {
          console.log(`${storeName} data updated successfully`);
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error(`Error updating ${storeName} data`, event.target.error);
          reject(event.target.error);
        };
      }
    });
  }

  async deleteData(storeName, key) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      
      // Validate the key before attempting to delete
      if (!isValidKey(key)) {
        reject(new Error(`Invalid key provided: ${key}`));
        return;
      }
      
      const request = objectStore.delete(key);

      request.onsuccess = () => {
        console.log(`${storeName} data deleted successfully`);
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error(`Error deleting ${storeName} data`, event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAllData(storeName) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error(`Error getting all ${storeName} data`, event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Specific methods for POS data
  async saveCart(cartData) {
    try {
      // Store cart data with a specific ID
      await this.updateData('carts', 'current_cart', cartData);
      console.log('Cart saved successfully');
    } catch (error) {
      console.error('Error saving cart:', error);
      throw error;
    }
  }

  async getSavedCart() {
    try {
      const cartData = await this.getData('carts', 'current_cart');
      console.log('Cart retrieved successfully');
      return cartData || null;
    } catch (error) {
      console.error('Error getting saved cart:', error);
      return null; // Return null if cart doesn't exist
    }
  }
  
  async clearCart() {
    try {
      await this.deleteData('carts', 'current_cart');
      console.log('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
  
  async saveSale(saleData) {
    try {
      // Generate a unique ID for the sale if it doesn't have one
      const saleId = saleData.id || `sale_${Date.now()}`;
      const saleToSave = { ...saleData, id: saleId };
      
      await this.addData('sales', saleToSave);
      console.log('Sale saved successfully');
      return saleId;
    } catch (error) {
      console.error('Error saving sale:', error);
      throw error;
    }
  }
  
  async getSavedSales() {
    try {
      const sales = await this.getAllData('sales');
      console.log(`Retrieved ${sales.length} saved sales`);
      return sales;
    } catch (error) {
      console.error('Error getting saved sales:', error);
      return [];
    }
  }
  
  async clearSales() {
    try {
      // Get all sales first to delete them individually
      const sales = await this.getAllData('sales');
      for (const sale of sales) {
        await this.deleteData('sales', sale.id);
      }
      console.log('Sales cleared successfully');
    } catch (error) {
      console.error('Error clearing sales:', error);
      throw error;
    }
  }
  
  async saveProduct(productData) {
    try {
      await this.addData('products', productData);
      console.log('Product saved successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }
  
  async getSavedProducts() {
    try {
      const products = await this.getAllData('products');
      console.log(`Retrieved ${products.length} saved products`);
      return products;
    } catch (error) {
      console.error('Error getting saved products:', error);
      return [];
    }
  }
  
  async syncWithServer() {
    try {
      // Retrieve all pending operations from storage
      const pendingSales = await this.getSavedSales();
      const pendingProducts = await this.getSavedProducts();
      
      // In a real implementation, this would sync with the server
      // and then clear the local data after successful sync
      
      return {
        salesCount: pendingSales.length,
        productsCount: pendingProducts.length
      };
    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  }
  
  // Check if the browser supports IndexedDB
  static isSupported() {
    return !!window.indexedDB;
  }
}

const offlineStorage = new OfflineStorage();
export default offlineStorage;