import { create } from 'zustand';
import { 
  getProducts, 
  getProduct,
  addProduct as addProductAPI, 
  updateProduct as updateProductAPI, 
  deleteProduct as deleteProductAPI,
  getCategories, 
  addCategory as addCategoryAPI, 
  updateCategory as updateCategoryAPI,
  getUsers,
  getUser,
  addUser as addUserAPI,
  updateUser as updateUserAPI,
  deleteUser as deleteUserAPI,
  getStores,
  getInventoryBatches,
  addInventoryBatch as addInventoryBatchAPI,
  updateInventoryBatch as updateInventoryBatchAPI,
  deleteInventoryBatch as deleteInventoryBatchAPI,
  getSales,
  addSale as addSaleAPI,
  getClients,
  addClient as addClientAPI,
  getTransfers,
  getShoppingList,
  getExpenses,
  getCashClosings,
  getSalesReport,
  initializeSupabaseCollections
} from '../utils/supabaseAPI';
import offlineStorage from '../utils/offlineStorage';
import { supabase } from '../config/supabase';


const useAppStore = create((set, get) => ({
  // --- STATE ---
  currentUser: null,
  currentView: 'login',
  activeTab: 'pos',
  cart: [],
  discount: { type: 'none', value: 0 }, // New discount state
  note: '', // New note state
  lastSale: null, // To store the last sale details for ticket printing
  darkMode: true, // Fixed dark mode (disabled toggle functionality)
  isOnline: navigator.onLine, // Add online status
  offlineMode: false, // Add offline mode flag
  
  // Catálogos
  products: [],
  categories: [],
  users: [],
  stores: [],
  clients: [], // New state for clients

  // Datos transaccionales
  inventoryBatches: [],
  transfers: [],
  salesHistory: [],
  expenses: [],
  shoppingList: [], // New state for shopping list
  cashClosings: [],
  
  // Reportes
  salesReport: null,

  // Loading state management
  setLoading: (key, value) => set(state => ({
    isLoading: { ...state.isLoading, [key]: value }
  })),
  
  setDiscount: (newDiscount) => set({ discount: newDiscount }), // New action to set discount
  setNote: (newNote) => set({ note: newNote }), // New action to set note
  addToShoppingList: (item) => set(state => ({ shoppingList: [...state.shoppingList, item] })), // New action to add to shopping list
  clearShoppingList: () => set({ shoppingList: [] }), // New action to clear shopping list
  toggleDarkMode: () => {
    // Dark mode toggle is disabled - always stay in dark mode
    console.log("Dark mode toggle is disabled");
  },
  
  // Network status management
  updateNetworkStatus: (isOnline) => {
    set({ isOnline, offlineMode: !isOnline });
    if (isOnline) {
      // Try to sync pending operations when coming back online
      get().syncPendingOperations();
      // Reload data from server
      if (get().currentUser) {
        get().loadAllData();
      }
    }
  },
  
  // Initialize network status listeners
  initNetworkListeners: () => {
    window.addEventListener('online', () => {
      get().updateNetworkStatus(true);
    });
    
    window.addEventListener('offline', () => {
      get().updateNetworkStatus(false);
    });
  },
  
  // Sync pending operations when online
  syncPendingOperations: async () => {
    // Sync pending sales
    try {
      const pendingSales = await offlineStorage.getAllData('pendingSales');
      if (pendingSales && pendingSales.length > 0) {
        console.log(`Syncing ${pendingSales.length} pending sales...`);
        
        for (const sale of pendingSales) {
          try {
            // Remove the temporary offline properties
            const { id, status, createdAt, ...saleData } = sale;
            
            // Save the sale to Firebase
            const saleId = await addSaleAPI(saleData);
            
            // Remove from offline storage after successful sync
            await offlineStorage.deleteData('pendingSales', sale.id);
            
            console.log(`Successfully synced sale ${sale.id} with new ID ${saleId}`);
          } catch (error) {
            console.error(`Error syncing sale ${sale.id}:`, error);
          }
        }
        
        // Reload sales history after sync
        await get().loadSalesHistory();
      }
    } catch (error) {
      console.error('Error syncing pending sales:', error);
    }
    
    console.log('Finished syncing pending operations');
  },

  // --- LÓGICA DE CARGA DE DATOS DESDE FIREBASE ---
  loadAllData: async () => {
    await Promise.all([
      get().loadProducts(),
      get().loadCategories(), 
      get().loadUsers(),
      get().loadStores(),
      get().loadInventoryBatches(),
      get().loadSalesHistory(),
      get().loadClients(),
      get().loadTransfers(),
      get().loadShoppingList(),
      get().loadExpenses(),
      get().loadCashClosings(),
    ]);
  },
  
  loadProducts: async () => {
    set({ isLoading: { ...get().isLoading, products: true } });
    try {
      // Try to load from network first if online
      if (get().isOnline) {
        const products = await getProducts();
        
        // Asegurar consistencia en los nombres de campos
        const mappedProducts = products.map(product => {
          return {
            ...product,
            // Mapear campos de categoría para consistencia
            categoryId: product.category_id || product.categoryId,
            subcategoryId: product.subcategory_id || product.subcategoryId,
            // Mapear otros campos posibles
            name: product.name || product.nombre || product.productName,
            description: product.description || product.descripcion,
            price: product.price || product.precio || 0,
            cost: product.cost || product.costo || 0,
            sku: product.sku || product.SKU,
            barcode: product.barcode || product.codigo_barras,
            unit: product.unit || product.unidad || product.unitOfMeasure,
            // Mantener campos originales para compatibilidad
            category_id: product.category_id || product.categoryId,
            subcategory_id: product.subcategory_id || product.subcategoryId
          };
        });
        
        set({ products: mappedProducts });
        // Store in offline storage for later use
        await Promise.all(mappedProducts.map(product => 
          offlineStorage.updateData('products', product.id, product)
        ));
      } else {
        // Load from offline storage
        const offlineProducts = await offlineStorage.getAllData('products');
        // Asegurar consistencia en los datos offline también
        const mappedOfflineProducts = offlineProducts.map(product => ({
          ...product,
          categoryId: product.category_id || product.categoryId,
          subcategoryId: product.subcategory_id || product.subcategoryId
        }));
        set({ products: mappedOfflineProducts });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      // Fallback to offline storage if network failed
      try {
        const offlineProducts = await offlineStorage.getAllData('products');
        const mappedOfflineProducts = offlineProducts.map(product => ({
          ...product,
          categoryId: product.category_id || product.categoryId,
          subcategoryId: product.subcategory_id || product.subcategoryId
        }));
        set({ products: mappedOfflineProducts });
      } catch (offlineError) {
        console.error("Error loading products from offline storage:", offlineError);
        // Si no hay productos en la base de datos y tampoco en offline, crear productos de ejemplo
        console.log("Creando productos de ejemplo para debug");
        const exampleProducts = [
          { id: 'debug-1', name: 'Coca Cola 600ml', price: 12.50, categoryId: 'bebidas', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: 'debug-2', name: 'Sabritas Original 42g', price: 10.00, categoryId: 'abarrotes', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: 'debug-3', name: 'Leche Lala 1L', price: 24.90, categoryId: 'lacteos', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: 'debug-4', name: 'Huevo Grande 12pz', price: 32.00, categoryId: 'abarrotes', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: 'debug-5', name: 'Pan Blanco Bimbo', price: 18.50, categoryId: 'panaderia', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          // Productos adicionales que estaban en el catálogo de pruebas
          { id: '6', name: 'bonafont', price: 15.00, categoryId: 'bebidas', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '7', name: 'Cahuamon Victoria', price: 55.00, categoryId: 'abarrotes', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '8', name: 'CI Malboro', price: 50.00, categoryId: 'vicio', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '9', name: 'Crema Alpura', price: 25.00, categoryId: 'lacteos', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '10', name: 'Crossantines', price: 7.00, categoryId: 'panaderia', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '11', name: 'Desodorante eGo', price: 50.00, categoryId: 'limpieza', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '12', name: 'Doritos Nacho', price: 18.00, categoryId: 'abarrotes', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '13', name: 'mayonesa', price: 25.00, categoryId: 'abarrotes', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '14', name: 'pruebasprod', price: 10.00, categoryId: 'abarrotes', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '15', name: 'pruebasTicket', price: 1.00, categoryId: 'abarrotes', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
          { id: '16', name: 'testPrdoduc', price: 15.00, categoryId: 'abarrotes', unit: 'unidad', minStockThreshold: { '1': 5, '2': 5, 'bodega-central': 10 } },
        ];
        set({ products: exampleProducts });
        
        // También guardar en offline storage para persistencia
        await Promise.all(exampleProducts.map(product => 
          offlineStorage.updateData('products', product.id, product)
        ));
      }
    } finally {
      set({ isLoading: { ...get().isLoading, products: false } });
    }
  },

  loadCategories: async () => {
    set({ isLoading: { ...get().isLoading, categories: true } });
    try {
      if (get().isOnline) {
        const categories = await getCategories();
        set({ categories });
        // Store in offline storage
        await Promise.all(categories.map(category => 
          offlineStorage.updateData('categories', category.id, category)
        ));
      } else {
        const offlineCategories = await offlineStorage.getAllData('categories');
        set({ categories: offlineCategories });
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      try {
        const offlineCategories = await offlineStorage.getAllData('categories');
        set({ categories: offlineCategories });
      } catch (offlineError) {
        console.error("Error loading categories from offline storage:", offlineError);
        // Si no hay categorías en la base de datos y tampoco en offline, crear categorías de ejemplo
        console.log("Creando categorías de ejemplo para debug");
        const exampleCategories = [
          { id: 'abarrotes', name: 'Abarrotes', description: 'Productos de abarrotes' },
          { id: 'bebidas', name: 'Bebidas', description: 'Bebidas en general' },
          { id: 'lacteos', name: 'Lácteos', description: 'Leche, quesos y derivados' },
          { id: 'panaderia', name: 'Panadería', description: 'Pan y productos de panadería' },
          { id: 'carnes', name: 'Carnes', description: 'Carnes y embutidos' },
          { id: 'frutas', name: 'Frutas', description: 'Frutas frescas' },
          { id: 'verduras', name: 'Verduras', description: 'Verduras frescas' },
          { id: 'limpieza', name: 'Limpieza', description: 'Productos de limpieza' },
          { id: 'vicio', name: 'Vicio', description: 'Cigarrillos y productos varios' },
        ];
        set({ categories: exampleCategories });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, categories: false } });
    }
  },

  loadUsers: async () => {
    set({ isLoading: { ...get().isLoading, users: true } });
    try {
      if (get().isOnline) {
        const users = await getUsers();
        
        // Mapear campos para consistencia
        const mappedUsers = users.map(user => {
          return {
            ...user,
            // Mapear campos de tienda para consistencia
            storeId: user.store_id || user.storeId,
            storeName: user.store_name || user.storeName,
            // Mantener campos originales para compatibilidad
            store_id: user.store_id || user.storeId,
            store_name: user.store_name || user.storeName
          };
        });
        
        set({ users: mappedUsers });
        // Store in offline storage
        await Promise.all(mappedUsers.map(user => 
          offlineStorage.updateData('users', user.id, user)
        ));
      } else {
        const offlineUsers = await offlineStorage.getAllData('users');
        // Mapear campos para consistencia en offline también
        const mappedOfflineUsers = offlineUsers.map(user => ({
          ...user,
          storeId: user.store_id || user.storeId,
          storeName: user.store_name || user.storeName
        }));
        set({ users: mappedOfflineUsers });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      try {
        const offlineUsers = await offlineStorage.getAllData('users');
        const mappedOfflineUsers = offlineUsers.map(user => ({
          ...user,
          storeId: user.store_id || user.storeId,
          storeName: user.store_name || user.storeName
        }));
        set({ users: mappedOfflineUsers });
      } catch (offlineError) {
        console.error("Error loading users from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, users: false } });
    }
  },

  loadStores: async () => {
    set({ isLoading: { ...get().isLoading, stores: true } });
    try {
      if (get().isOnline) {
        const stores = await getStores();
        set({ stores });
        // Store in offline storage
        await Promise.all(stores.map(store => 
          offlineStorage.updateData('stores', store.id, store)
        ));
      } else {
        const offlineStores = await offlineStorage.getAllData('stores');
        set({ stores: offlineStores });
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      try {
        const offlineStores = await offlineStorage.getAllData('stores');
        set({ stores: offlineStores });
      } catch (offlineError) {
        console.error("Error loading stores from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, stores: false } });
    }
  },

  loadInventoryBatches: async () => {
    set({ isLoading: { ...get().isLoading, inventory: true } });
    try {
      if (get().isOnline) {
        const inventoryBatches = await getInventoryBatches();
        
        // Asegurar consistencia en los nombres de campos
        const mappedInventoryBatches = inventoryBatches.map(batch => {
          // Mapear de snake_case a camelCase manteniendo ambos para compatibilidad
          const mapped = {
            ...batch,
            // Campos principales
            inventoryId: batch.id || batch.inventoryId,
            productId: batch.product_id || batch.productId || batch.productId,
            locationId: batch.location_id || batch.locationId || batch.storeId,
            quantity: batch.quantity || 0,
            expirationDate: batch.expiration_date || batch.expirationDate,
            cost: batch.cost || batch.cost || 0,
            // Mantener campos originales para compatibilidad
            product_id: batch.product_id || batch.productId,
            location_id: batch.location_id || batch.locationId,
            expiration_date: batch.expiration_date || batch.expirationDate,
          };
          return mapped;
        });
        
        set({ inventoryBatches: mappedInventoryBatches });
        
        // Guardar en almacenamiento offline
        await Promise.all(mappedInventoryBatches.map(batch => 
          offlineStorage.updateData('inventoryBatches', batch.inventoryId, batch)
        ));
      } else {
        const offlineInventoryBatches = await offlineStorage.getAllData('inventoryBatches');
        // Asegurar consistencia en los datos offline también
        const mappedOfflineBatches = offlineInventoryBatches.map(batch => ({
          ...batch,
          productId: batch.product_id || batch.productId || batch.productId,
          locationId: batch.location_id || batch.locationId || batch.storeId,
          expirationDate: batch.expiration_date || batch.expirationDate,
        }));
        set({ inventoryBatches: mappedOfflineBatches });
      }
    } catch (error) {
      console.error("Error loading inventory batches:", error);
      try {
        const offlineInventoryBatches = await offlineStorage.getAllData('inventoryBatches');
        const mappedOfflineBatches = offlineInventoryBatches.map(batch => ({
          ...batch,
          productId: batch.product_id || batch.productId,
          locationId: batch.location_id || batch.locationId,
          expirationDate: batch.expiration_date || batch.expirationDate,
        }));
        set({ inventoryBatches: mappedOfflineBatches });
      } catch (offlineError) {
        console.error("Error loading inventory batches from offline storage:", offlineError);
        // Si no hay inventario en la base de datos y tampoco en offline, crear inventario de ejemplo
        console.log("Creando inventario de ejemplo para debug");
        const exampleInventoryBatches = [
          // Inventario para los productos originales de ejemplo
          { inventoryId: 'inv-1', productId: 'debug-1', locationId: '1', quantity: 20, cost: 10.00 },
          { inventoryId: 'inv-2', productId: 'debug-2', locationId: '1', quantity: 15, cost: 8.00 },
          { inventoryId: 'inv-3', productId: 'debug-3', locationId: '1', quantity: 10, cost: 20.00 },
          { inventoryId: 'inv-4', productId: 'debug-4', locationId: '1', quantity: 12, cost: 25.00 },
          { inventoryId: 'inv-5', productId: 'debug-5', locationId: '1', quantity: 8, cost: 15.00 },
          
          // Inventario para los productos adicionales que están en el catálogo
          { inventoryId: 'inv-6', productId: '6', locationId: '1', quantity: 30, cost: 12.00 },
          { inventoryId: 'inv-7', productId: '7', locationId: '1', quantity: 15, cost: 45.00 },
          { inventoryId: 'inv-8', productId: '8', locationId: '1', quantity: 20, cost: 40.00 },
          { inventoryId: 'inv-9', productId: '9', locationId: '1', quantity: 25, cost: 20.00 },
          { inventoryId: 'inv-10', productId: '10', locationId: '1', quantity: 40, cost: 5.00 },
          { inventoryId: 'inv-11', productId: '11', locationId: '1', quantity: 18, cost: 40.00 },
          { inventoryId: 'inv-12', productId: '12', locationId: '1', quantity: 35, cost: 15.00 },
          { inventoryId: 'inv-13', productId: '13', locationId: '1', quantity: 22, cost: 20.00 },
          { inventoryId: 'inv-14', productId: '14', locationId: '1', quantity: 30, cost: 8.00 },
          { inventoryId: 'inv-15', productId: '15', locationId: '1', quantity: 50, cost: 0.80 },
          { inventoryId: 'inv-16', productId: '16', locationId: '1', quantity: 28, cost: 12.00 },
          
          // Inventario para las demás tiendas
          { inventoryId: 'inv-17', productId: 'debug-1', locationId: '2', quantity: 18, cost: 10.00 },
          { inventoryId: 'inv-18', productId: 'debug-2', locationId: '2', quantity: 12, cost: 8.00 },
          { inventoryId: 'inv-19', productId: 'debug-3', locationId: '2', quantity: 9, cost: 20.00 },
          { inventoryId: 'inv-20', productId: 'debug-4', locationId: '2', quantity: 11, cost: 25.00 },
          { inventoryId: 'inv-21', productId: 'debug-5', locationId: '2', quantity: 7, cost: 15.00 },
          { inventoryId: 'inv-22', productId: '6', locationId: '2', quantity: 25, cost: 12.00 },
          { inventoryId: 'inv-23', productId: '7', locationId: '2', quantity: 10, cost: 45.00 },
          { inventoryId: 'inv-24', productId: '8', locationId: '2', quantity: 15, cost: 40.00 },
          { inventoryId: 'inv-25', productId: '9', locationId: '2', quantity: 20, cost: 20.00 },
          { inventoryId: 'inv-26', productId: '10', locationId: '2', quantity: 30, cost: 5.00 },
          { inventoryId: 'inv-27', productId: '11', locationId: '2', quantity: 12, cost: 40.00 },
          { inventoryId: 'inv-28', productId: '12', locationId: '2', quantity: 25, cost: 15.00 },
          { inventoryId: 'inv-29', productId: '13', locationId: '2', quantity: 18, cost: 20.00 },
          { inventoryId: 'inv-30', productId: '14', locationId: '2', quantity: 20, cost: 8.00 },
          { inventoryId: 'inv-31', productId: '15', locationId: '2', quantity: 40, cost: 0.80 },
          { inventoryId: 'inv-32', productId: '16', locationId: '2', quantity: 22, cost: 12.00 },
          
          // Inventario para bodega central
          { inventoryId: 'inv-33', productId: 'debug-1', locationId: 'bodega-central', quantity: 50, cost: 10.00 },
          { inventoryId: 'inv-34', productId: 'debug-2', locationId: 'bodega-central', quantity: 40, cost: 8.00 },
          { inventoryId: 'inv-35', productId: 'debug-3', locationId: 'bodega-central', quantity: 35, cost: 20.00 },
          { inventoryId: 'inv-36', productId: 'debug-4', locationId: 'bodega-central', quantity: 30, cost: 25.00 },
          { inventoryId: 'inv-37', productId: 'debug-5', locationId: 'bodega-central', quantity: 25, cost: 15.00 },
          { inventoryId: 'inv-38', productId: '6', locationId: 'bodega-central', quantity: 100, cost: 12.00 },
          { inventoryId: 'inv-39', productId: '7', locationId: 'bodega-central', quantity: 60, cost: 45.00 },
          { inventoryId: 'inv-40', productId: '8', locationId: 'bodega-central', quantity: 80, cost: 40.00 },
          { inventoryId: 'inv-41', productId: '9', locationId: 'bodega-central', quantity: 70, cost: 20.00 },
          { inventoryId: 'inv-42', productId: '10', locationId: 'bodega-central', quantity: 90, cost: 5.00 },
          { inventoryId: 'inv-43', productId: '11', locationId: 'bodega-central', quantity: 55, cost: 40.00 },
          { inventoryId: 'inv-44', productId: '12', locationId: 'bodega-central', quantity: 85, cost: 15.00 },
          { inventoryId: 'inv-45', productId: '13', locationId: 'bodega-central', quantity: 65, cost: 20.00 },
          { inventoryId: 'inv-46', productId: '14', locationId: 'bodega-central', quantity: 75, cost: 8.00 },
          { inventoryId: 'inv-47', productId: '15', locationId: 'bodega-central', quantity: 120, cost: 0.80 },
          { inventoryId: 'inv-48', productId: '16', locationId: 'bodega-central', quantity: 70, cost: 12.00 },
        ];
        set({ inventoryBatches: exampleInventoryBatches });
        
        // También guardar en offline storage para persistencia
        await Promise.all(exampleInventoryBatches.map(batch => 
          offlineStorage.updateData('inventoryBatches', batch.inventoryId, batch)
        ));
      }
    } finally {
      set({ isLoading: { ...get().isLoading, inventory: false } });
    }
  },

  loadSalesHistory: async () => {
    set({ isLoading: { ...get().isLoading, sales: true } });
    try {
      if (get().isOnline) {
        const salesHistory = await getSales();
        set({ salesHistory });
        // Store in offline storage (limit to last 100 sales for storage efficiency)
        const limitedSales = salesHistory.slice(0, 100);
        await Promise.all(limitedSales.map(sale => 
          offlineStorage.updateData('sales', sale.saleId, sale)
        ));
      } else {
        const offlineSales = await offlineStorage.getAllData('sales');
        set({ salesHistory: offlineSales });
      }
    } catch (error) {
      console.error("Error loading sales history:", error);
      try {
        const offlineSales = await offlineStorage.getAllData('sales');
        set({ salesHistory: offlineSales });
      } catch (offlineError) {
        console.error("Error loading sales from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, sales: false } });
    }
  },

  loadClients: async () => {
    set({ isLoading: { ...get().isLoading, clients: true } });
    try {
      if (get().isOnline) {
        const clients = await getClients();
        set({ clients });
        // Store in offline storage
        await Promise.all(clients.map(client => 
          offlineStorage.updateData('clients', client.id, client)
        ));
      } else {
        const offlineClients = await offlineStorage.getAllData('clients');
        set({ clients: offlineClients });
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      try {
        const offlineClients = await offlineStorage.getAllData('clients');
        set({ clients: offlineClients });
      } catch (offlineError) {
        console.error("Error loading clients from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, clients: false } });
    }
  },

  loadTransfers: async () => {
    try {
      const transfers = await getTransfers();
      set({ transfers });
    } catch (error) {
      console.error("Error loading transfers:", error);
    }
  },

  loadShoppingList: async () => {
    try {
      const shoppingList = await getShoppingList();
      set({ shoppingList });
    } catch (error) {
      console.error("Error loading shopping list:", error);
    }
  },

  loadExpenses: async () => {
    try {
      const expenses = await getExpenses();
      set({ expenses });
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  },

  loadCashClosings: async () => {
    try {
      const cashClosings = await getCashClosings();
      set({ cashClosings });
    } catch (error) {
      console.error("Error loading cash closings:", error);
    }
  },

  fetchSalesReport: async ({ startDate, endDate, storeId = null, reportType = 'daily' }) => {
    try {
      set({ isLoading: { ...get().isLoading, salesReport: true } });
      
      const report = await getSalesReport(startDate, endDate, storeId, reportType);
      
      set({ salesReport: report });
      
      return report;
    } catch (error) {
      console.error("Error fetching sales report:", error);
      return null;
    } finally {
      set({ isLoading: { ...get().isLoading, salesReport: false } });
    }
  },

  // --- LÓGICA DE CLIENTES ---
  addClient: async (clientData) => {
    try {
      const clientId = await addClientAPI({
        ...clientData,
        creditBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Reload clients to reflect the change
      await get().loadClients();
      
      return { success: true, id: clientId };
    } catch (error) {
      console.error("Error adding client:", error);
      return { success: false, error: error.message };
    }
  },
  updateClient: async (id, updatedData) => {
    try {
      // Implementation will depend on your Firestore update function
      // For now, we'll reload clients after updating
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating client:", error);
      return { success: false, error: error.message };
    }
  },
  deleteClient: async (id) => {
    try {
      // Implementation will depend on your Firestore delete function
      // For now, we'll reload clients after deletion
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting client:", error);
      return { success: false, error: error.message };
    }
  },
  grantCredit: async (clientId, amount) => {
    try {
      // Implementation will depend on your Firestore update function
      // For now, we'll reload clients after updating credit
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error granting credit:", error);
      return { success: false, error: error.message };
    }
  },
  recordPayment: async (clientId, amount) => {
    try {
      // Implementation will depend on your Firestore update function
      // For now, we'll reload clients after recording payment
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error recording payment:", error);
      return { success: false, error: error.message };
    }
  },
  liquidateCredit: async (clientId) => {
    try {
      // Implementation will depend on your Firestore update function
      // For now, we'll reload clients after liquidating credit
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error liquidating credit:", error);
      return { success: false, error: error.message };
    }
  },
  addReminder: (reminderData) => {
    const newReminder = { ...reminderData, id: `rem-${Date.now()}`, isConcluded: false, createdAt: new Date().toISOString() };
    set(state => ({ reminders: [...state.reminders, newReminder] }));
  },

  markReminderAsConcluded: (id) => {
    set(state => ({
      reminders: state.reminders.map(rem => rem.id === id ? { ...rem, isConcluded: true } : rem)
    }));
  },
  // --- LÓGICA DE TRANSFERENCIAS ---
  createTransferRequest: ({ items }) => {
    const { currentUser, stores } = get();
    const destinationStore = stores.find(s => s.id === currentUser.storeId);

    if (!destinationStore) {
      console.error("Cannot create transfer request: User has no assigned store.");
      return;
    }

    const newTransfer = {
      id: `TR-${Date.now()}`,
      originLocationId: 'bodega-central',
      destinationLocationId: destinationStore.id,
      requestedBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      status: 'solicitado',
      items: items, // [{ productId, productName, requestedQuantity }]
      history: [{ status: 'solicitado', date: new Date().toISOString(), userId: currentUser.uid }],
    };

    set(state => ({
      transfers: [...state.transfers, newTransfer]
    }));
  },

  alerts: [],
  reminders: [], // New state for reminders

  // Configuración
  alertSettings: {
    daysBeforeExpiration: 30,
    cardCommissionRate: 0.04, // 4% commission
  },

  // Weight modal functionality
  isWeightModalOpen: false,
  weighingProduct: null,
  
  openWeightModal: (product) => set({ isWeightModalOpen: true, weighingProduct: product }),
  closeWeightModal: () => set({ isWeightModalOpen: false, weighingProduct: null }),
  
  addToCartWithWeight: (product, weight) => {
    const { currentUser, inventoryBatches, cart } = get();
    const storeId = currentUser?.storeId;

    if (!storeId) {
      console.error("No store ID found for current user. Cannot add to cart.");
      return;
    }

    // Check if we have enough stock
    const totalStockInLocation = inventoryBatches
      .filter(batch => batch.productId === product.id && batch.locationId === storeId)
      .reduce((sum, batch) => sum + batch.quantity, 0);

    if (weight > totalStockInLocation) {
      console.warn(`Cannot add ${weight} of ${product.name} to cart. Insufficient stock.`);
      return; 
    }

    // Check if the item is already in the cart (for weight-based products)
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // If the item exists, update its quantity by adding the new weight
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + weight
      };
      set({ cart: updatedCart });
    } else {
      // Add new product with the specified weight as quantity
      const newCartItem = { 
        ...product, 
        quantity: weight,
        unit: product.unit || 'kg' // Store the unit for reference
      };
      set((state) => ({
        cart: [...state.cart, newCartItem],
      }));
    }
    
    // Save cart to offline storage
    offlineStorage.saveCart(get().cart);
  },
    // --- ACTIONS ---
  
    // Inicialización
    initialize: async () => {
      console.log("useAppStore initialize function called.");
      const storedTicketSettings = localStorage.getItem('ticketSettings');
      let initialTicketSettings = get().ticketSettings; // Get default settings
      const darkModePreference = true; // Fixed dark mode (disabled toggle functionality)
  
      if (storedTicketSettings) {
        const parsedSettings = JSON.parse(storedTicketSettings);
        console.log("Loading ticketSettings from localStorage:", parsedSettings);
        initialTicketSettings = { ...initialTicketSettings, ...parsedSettings }; // Merge with stored
      }
  
      // Initialize network listeners for offline support
      get().initNetworkListeners();
  
      // Initialize Supabase collections if needed
      await initializeSupabaseCollections();
  
      // Load data from Firebase
      await Promise.all([
        get().loadProducts(),
        get().loadCategories(), 
        get().loadUsers(),
        get().loadStores(),
        get().loadInventoryBatches(),
        get().loadSalesHistory(),
        get().loadClients(),
        get().loadTransfers(),
        get().loadShoppingList(),
        get().loadExpenses(),
        get().loadCashClosings(),
      ]);
  
      set({
        ticketSettings: initialTicketSettings, // Set merged settings
        darkMode: darkModePreference, // Set dark mode preference
        isOnline: navigator.onLine, // Set initial network status
        offlineMode: !navigator.onLine, // Set initial offline mode
      });
      get().checkAllAlerts();
    },
  
    // Autenticación
    handleLogin: async (email, password) => {
      try {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid email/phone')) {
            return { success: false, error: "Usuario o contraseña incorrectos" };
          } else {
            return { success: false, error: `Error de autenticación: ${error.message}` };
          }
        }
        
        // La respuesta de autenticación de Supabase tiene la estructura data.user
        if (!data || !data.user) {
          return { success: false, error: "Error de autenticación: No se recibió información de usuario" };
        }
        
        // Fetch user details from Supabase
        const userDoc = await getUser(data.user.id);
        if (userDoc) {
          set({
            currentUser: {
              ...userDoc,
              storeId: userDoc.storeId || userDoc.store_id, // Ensure storeId is properly mapped
              storeName: userDoc.storeName || userDoc.store_name || 'Tienda no asignada' // Ensure storeName is available
            },
            currentView: userDoc.role === 'admin' || userDoc.role === 'gerente' ? 'admin-dashboard' : 'pos',
          });
          // Initialize the app data after login
          await get().initialize();
          return { success: true, user: userDoc };
        } else {
          return { success: false, error: "Usuario no encontrado en la base de datos" };
        }
      } catch (error) {
        return { success: false, error: `Error de autenticación: ${error.message}` };
      }
    },
    handleLogout: () => {
      set({ 
        currentUser: null, 
        currentView: 'login', 
        cart: [],
        // Reset all data to empty arrays
        products: [],
        categories: [],
        users: [],
        stores: [],
        clients: [],
        inventoryBatches: [],
        transfers: [],
        salesHistory: [],
        expenses: [],
        shoppingList: [],
        cashClosings: [],
      });
    },
  
    // Navegación
    setCurrentView: (view) => set({ currentView: view }),
    setActiveTab: (tab) => set({ activeTab: tab }),
  
    // Carrito
    addToCart: (product) => {
      const { currentUser, inventoryBatches, cart } = get();
      
      // Si no hay currentUser, usar un storeId por defecto para fines de prueba
      const storeId = currentUser?.storeId || '1';
  
      if (!storeId) {
        console.error("No store ID found for current user. Cannot add to cart.");
        return;
      }
  
      // For offline mode, we'll use the last known inventory
      let stockInLocation = 0;
      if (inventoryBatches && inventoryBatches.length > 0) {
        stockInLocation = inventoryBatches
          .filter(batch => String(batch.productId) === String(product.id) && String(batch.locationId) === String(storeId))
          .reduce((sum, batch) => sum + batch.quantity, 0);
      } else {
        // If no inventory data is available (offline), allow adding to cart
        stockInLocation = Infinity;
      }
  
      // En modo desarrollo, permitir agregar productos aunque no tengan stock
      if (process.env.NODE_ENV === 'development' || stockInLocation === Infinity) {
        set((state) => {
          const existingItem = state.cart.find(item => item.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          } else {
            return {
              cart: [...state.cart, { ...product, quantity: 1 }],
            };
          }
        });
      } else {
        // En producción, verificar stock real
        const itemInCart = cart.find(item => item.id === product.id);
        const quantityInCart = itemInCart ? itemInCart.quantity : 0;
  
        if (quantityInCart >= stockInLocation) {
          console.warn(`Cannot add more ${product.name} to cart. Stock limit reached.`);
          return; 
        }
  
        set((state) => {
          const existingItem = state.cart.find(item => item.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          } else {
            return {
              cart: [...state.cart, { ...product, quantity: 1 }],
            };
          }
        });
      }
      
      // Save cart to offline storage
      offlineStorage.saveCart(get().cart);
    },
    removeFromCart: (productId) => {
      set((state) => ({
        cart: state.cart.filter(item => item.id !== productId),
      }));
      // Save cart to offline storage
      offlineStorage.saveCart(get().cart);
    },
  
    updateCartItemQuantity: (productId, quantity) => {
      set((state) => ({
        cart: state.cart.map(item =>
          item.id === productId ? { ...item, quantity: quantity } : item
        ).filter(item => item.quantity > 0),
      }));
      // Save cart to offline storage
      offlineStorage.saveCart(get().cart);
    },
  
    handleCheckout: async (payment) => {
      const { cart, currentUser, inventoryBatches, discount, note, isOnline } = get();
      const { cash, card, cardCommission, commissionInCash } = payment;
      const storeId = currentUser?.storeId;
  
      if (!storeId) {
        console.error("Checkout failed: No store ID for current user.");
        return;
      }
  
      // Create a copy of inventory batches to update
      let updatedBatches = JSON.parse(JSON.stringify(inventoryBatches)); // Deep copy to avoid mutation issues
  
      // Deduct quantities from inventory batches
      for (const item of cart) {
        let quantityToDeduct = item.quantity;
  
        const relevantBatches = updatedBatches
          .filter(b => b.productId === item.id && b.locationId === storeId)
          .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
  
        for (const batch of relevantBatches) {
          if (quantityToDeduct <= 0) break;
  
          const deductAmount = Math.min(quantityToDeduct, batch.quantity);
          batch.quantity -= deductAmount;
          quantityToDeduct -= deductAmount;
        }
      }
  
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      let finalTotal = subtotal;
  
      if (discount.type === 'percentage') {
        finalTotal = subtotal * (1 - discount.value / 100);
      } else if (discount.type === 'amount') {
        finalTotal = subtotal - discount.value;
      }
  
      // Apply card commission
      if (cardCommission > 0 && !commissionInCash) {
        finalTotal += cardCommission;
      }
  
      const saleDetails = {
        cart: cart.map(item => ({...item})), // Create a copy to avoid reference issues
        subtotal: subtotal,
        discount: discount,
        note: note,
        total: finalTotal,
        cash: cash,
        card: card,
        cardCommission: cardCommission,
        commissionInCash: commissionInCash,
        cashier: currentUser ? currentUser.name : 'Unknown',
        storeId: storeId,
        date: new Date().toISOString(), // This will be set by Firebase serverTimestamp
      };
  
      // If offline, store the sale for later sync
      if (!isOnline) {
        const offlineSaleId = `offline-sale-${Date.now()}`;
        const offlineSale = {
          ...saleDetails,
          id: offlineSaleId,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        // Store in offline storage
        await offlineStorage.updateData('pendingSales', offlineSaleId, offlineSale);
        
        // Update inventory batches in offline storage
        await Promise.all(updatedBatches.map(batch => 
          offlineStorage.updateData('inventoryBatches', batch.inventoryId, batch)
        ));
        
        // Update the state
        set({ 
          cart: [], 
          lastSale: { ...saleDetails, saleId: offlineSaleId },
          salesHistory: [...get().salesHistory, { ...saleDetails, saleId: offlineSaleId }],
          discount: { type: 'none', value: 0 }, // Reset discount after checkout
          note: '', // Reset note after checkout
          inventoryBatches: updatedBatches.filter(b => b.quantity > 0),
        });
  
        get().checkAllAlerts();
        
        return { success: true, saleId: offlineSaleId, offline: true };
      }
  
      try {
        // Save the sale to Firebase
        const saleId = await addSaleAPI(saleDetails);
        
        // Update inventory batches in Firebase
        // For simplicity, we'll reload inventory after checkout
        await get().loadInventoryBatches();
  
        // Update the state
        set({ 
          cart: [], 
          lastSale: { ...saleDetails, saleId }, // Add the generated sale ID
          salesHistory: [...get().salesHistory, { ...saleDetails, saleId }], // Add sale to history
          discount: { type: 'none', value: 0 }, // Reset discount after checkout
          note: '', // Reset note after checkout
        });
  
        get().checkAllAlerts();
        
        return { success: true, saleId };
      } catch (error) {
        console.error("Error processing checkout:", error);
        return { success: false, error: error.message };
      }
    },
  // --- LÓGICA DE TRANSFERENCIAS ---
  createTransferRequest: ({ items }) => {
    const { currentUser, stores } = get();
    const destinationStore = stores.find(s => s.id === currentUser.storeId);

    if (!destinationStore) {
      console.error("Cannot create transfer request: User has no assigned store.");
      return;
    }

    const newTransfer = {
      id: `TR-${Date.now()}`,
      originLocationId: 'bodega-central',
      destinationLocationId: destinationStore.id,
      requestedBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      status: 'solicitado',
      items: items, // [{ productId, productName, requestedQuantity }]
      history: [{ status: 'solicitado', date: new Date().toISOString(), userId: currentUser.uid }],
    };

    set(state => ({
      transfers: [...state.transfers, newTransfer]
    }));
  },
  // --- LÓGICA DE CONSUMO DE EMPLEADOS ---
  recordEmployeeConsumption: (consumedItems, consumingUser) => {
    const { inventoryBatches } = get();
    let updatedBatches = JSON.parse(JSON.stringify(inventoryBatches));

    // Deduct stock for each consumed item
    for (const item of consumedItems) {
      let quantityToDeduct = item.quantity;

      // Find and sort relevant batches (FEFO) for the consuming user's store
      const relevantBatches = updatedBatches
        .filter(b => b.productId === item.id && b.locationId === consumingUser.storeId)
        .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

      for (const batch of relevantBatches) {
        if (quantityToDeduct <= 0) break;

        const deductAmount = Math.min(quantityToDeduct, batch.quantity);
        batch.quantity -= deductAmount;
        quantityToDeduct -= deductAmount;
      }
    }

    // Record the consumption (e.g., in a separate consumption history or as a special expense)
    const consumptionRecord = {
      id: `CONS-${Date.now()}`,
      date: new Date().toISOString(),
      items: consumedItems,
      user: consumingUser.name,
      storeId: consumingUser.storeId,
      type: 'Consumo de Empleado',
    };
    console.log("Employee Consumption Recorded:", consumptionRecord);

    set({ 
      inventoryBatches: updatedBatches.filter(b => b.quantity > 0),
      // Optionally, add to a separate consumption history array
    });

    get().checkAllAlerts();
  },

  checkAllAlerts: async () => {
    try {
      // Get most recent data from state (which should be from Supabase)
      const { inventoryBatches, products, stores, alertSettings } = get();
      const newAlerts = [];

      // 1. Alertas de Stock Bajo
      stores.forEach(store => {
        products.forEach(product => {
          const totalStockInLocation = inventoryBatches
            .filter(batch => String(batch.productId) === String(product.id) && String(batch.locationId) === String(store.id))
            .reduce((sum, batch) => sum + batch.quantity, 0);
          
          const threshold = product.minStockThreshold?.[store.id];

          if (threshold !== undefined && totalStockInLocation < threshold) {
            newAlerts.push({
              id: `low-stock-${product.id}-${store.id}`,
              type: 'Stock Bajo',
              message: `Quedan ${totalStockInLocation} de ${product.name} en ${store.name}. (Mínimo: ${threshold})`,
              isRead: false,
            });
          }
        });
      });

      // 2. Alertas de Próxima Caducidad
      const today = new Date();
      const alertDate = new Date();
      alertDate.setDate(today.getDate() + alertSettings.daysBeforeExpiration);

      inventoryBatches.forEach(batch => {
        if (batch.expirationDate) {
          const expiration = new Date(batch.expirationDate);
          if (expiration > today && expiration <= alertDate) {
            const product = products.find(p => String(p.id) === String(batch.productId));
            const store = stores.find(s => String(s.id) === String(batch.locationId));
            if (product && store) {
              newAlerts.push({
                id: `exp-${batch.inventoryId || batch.id}`,
                type: 'Próxima Caducidad',
                message: `${batch.quantity} de ${product.name} en ${store.name} vencen el ${batch.expirationDate}.`,
                isRead: false,
              });
            }
          }
        }
      });

      set({ alerts: newAlerts });
      return { success: true };
    } catch (error) {
      console.error("Error checking alerts:", error);
      return { success: false, error: error.message };
    }
  },

  // --- LÓGICA DE CONFIGURACIÓN DE TICKET ---
  ticketSettings: {
    headerText: '¡Gracias por tu compra!',
    footerText: 'Vuelve pronto.',
    showQrCode: true,
    fontSize: 'base',
    logoUrl: '',
  },

  updateTicketSettings: (newSettings) => {
    set(state => {
      const updatedSettings = { ...state.ticketSettings, ...newSettings };
      console.log("Saving ticketSettings to localStorage:", updatedSettings);
      localStorage.setItem('ticketSettings', JSON.stringify(updatedSettings));
      return { ticketSettings: updatedSettings };
    });
  },

  updateAlertSettings: (newSettings) => {
    set(state => {
      const updatedSettings = { ...state.alertSettings, ...newSettings };
      console.log("Saving alertSettings to localStorage:", updatedSettings);
      localStorage.setItem('alertSettings', JSON.stringify(updatedSettings));
      return { alertSettings: updatedSettings };
    });
  },

}));

export default useAppStore;