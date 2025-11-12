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
  getStore, // ADDED: Import getStore function
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
  addExpense as addExpenseAPI,
  updateExpense as updateExpenseAPI,
  deleteExpense as deleteExpenseAPI,
  approveExpense as approveExpenseAPI,
  getCashClosings,
  addCashClosing,
  getSalesReport,
  initializeSupabaseCollections
} from '../utils/supabaseAPI';
import offlineStorage from '../utils/offlineStorage';
import { supabase } from '../config/supabase';
import { notificationService } from '../utils/NotificationService';


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
  shoppingList: [], // Will now store objects with detailed structure
  cashClosings: [],
  
  // Reportes
  salesReport: null,

  // Loading state management
  setLoading: (key, value) => set(state => ({
    isLoading: { ...state.isLoading, [key]: value }
  })),
  
  setDiscount: (newDiscount) => set({ discount: newDiscount }), // New action to set discount
  setNote: (newNote) => set({ note: newNote }), // New action to set note
  clearLastSale: () => set({ lastSale: null }),
  
  // Shopping List Actions
  addToShoppingList: (description, expectedCost = 0) => set(state => {
    const newItem = {
      id: `sl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
      description,
      expectedCost,
      actualCost: 0,
      isPurchased: false,
      isProduct: false, // Default to false, can be changed later
    };
    return { shoppingList: [...state.shoppingList, newItem] };
  }),
  updateShoppingListItem: (id, updatedFields) => set(state => {
    console.log("useAppStore: Updating shopping list item:", id, updatedFields);
    const updatedList = state.shoppingList.map(item =>
      item.id === id ? { ...item, ...updatedFields } : item
    );
    console.log("useAppStore: Shopping list after update:", updatedList);
    return { shoppingList: updatedList };
  }),
  removeShoppingListItem: (id) => set(state => {
    console.log("useAppStore: Removing shopping list item:", id);
    const updatedList = state.shoppingList.filter(item => item.id !== id);
    console.log("useAppStore: Shopping list after removal:", updatedList);
    return { shoppingList: updatedList };
  }),
  generateExpenseFromShoppingList: async () => {
    const { shoppingList, addExpense } = get();
    const purchasedItems = shoppingList.filter(item => item.isPurchased);
    console.log("useAppStore: Items marked as purchased:", purchasedItems);

    if (purchasedItems.length === 0) {
      console.warn("No items marked as purchased in the shopping list.");
      return { success: false, message: "No hay elementos marcados como comprados." };
    }

    const totalAmount = purchasedItems.reduce((sum, item) => sum + (parseFloat(item.actualCost) || 0), 0);
    const description = `Compras misceláneas (${purchasedItems.map(item => item.description).join(', ')})`;
    console.log("useAppStore: Total amount for expense:", totalAmount);
    console.log("useAppStore: Expense description:", description);

    try {
      await addExpense({ description, amount: totalAmount, type: 'Gasto Operativo' });
      // Remove purchased items from the shopping list
      set(state => {
        const updatedList = state.shoppingList.filter(item => !item.isPurchased);
        console.log("useAppStore: Shopping list after expense generation (purchased items removed):", updatedList);
        return { shoppingList: updatedList };
      });
      return { success: true, message: "Gasto generado exitosamente." };
    } catch (error) {
      console.error("Error generating expense from shopping list:", error);
      return { success: false, message: `Error al generar el gasto: ${error.message}` };
    }
  },

  // End Shopping List Actions

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
      // Data will now be re-fetched by components as needed, not all at once.
    }
  },
  
  // Initialize network and notification status
  initNetworkListeners: () => {
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

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

  // --- LÓGICA DE CARGA DE DATOS ---
  // These functions are now intended to be called on-demand by components,
  // not all at once at startup.
  
  loadProducts: async () => {
    set({ isLoading: { ...get().isLoading, products: true } });
    try {
      // Try to load from network first if online
      if (get().isOnline) {
        const { data: products } = await getProducts(); // Using paginated API
        
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
      }
    } finally {
      set({ isLoading: { ...get().isLoading, categories: false } });
    }
  },

  loadUsers: async () => {
    set({ isLoading: { ...get().isLoading, users: true } });
    try {
      if (get().isOnline) {
        const { data: users } = await getUsers();
        
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
        const { data: inventoryBatches } = await getInventoryBatches();
        
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
      }
    } finally {
      set({ isLoading: { ...get().isLoading, inventory: false } });
    }
  },

  loadSalesHistory: async () => {
    set({ isLoading: { ...get().isLoading, sales: true } });
    try {
      if (get().isOnline) {
        const { data: salesHistory } = await getSales();
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
        const { data: clients } = await getClients();
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
      const { data: transfers } = await getTransfers();
      set({ transfers });
    } catch (error) {
      console.error("Error loading transfers:", error);
    }
  },

  loadShoppingList: async () => {
    try {
      const { data: shoppingList } = await getShoppingList();
      set({ shoppingList });
    } catch (error) {
      console.error("Error loading shopping list:", error);
    }
  },

  loadExpenses: async () => {
    try {
      const { data: expenses } = await getExpenses();
      set({ expenses });
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  },

  loadCashClosings: async () => {
    try {
      const { data: cashClosings } = await getCashClosings();
      set({ cashClosings });
    } catch (error) {
      console.error("Error loading cash closings:", error);
    }
  },

  addCashClosing: async (cashClosingData) => {
    try {
      const newCashClosing = await addCashClosing(cashClosingData);
      
      // Update the local state to include the new cash closing
      set(state => ({
        cashClosings: [newCashClosing, ...state.cashClosings]
      }));
      
      return newCashClosing;
    } catch (error) {
      console.error("Error adding cash closing:", error);
      throw error;
    }
  },

  addExpense: async (expenseData) => {
    try {
      // Agregar el gasto a través de la API
      const expenseId = await addExpenseAPI(expenseData);

      // Recargar gastos para reflejar el cambio
      await get().loadExpenses();

      return { success: true, id: expenseId };
    } catch (error) {
      console.error("Error adding expense:", error);
      return { success: false, error: error.message };
    }
  },

  notifyAdminsOfPendingExpense: (expenseData) => {
    // Verificar si hay soporte para notificaciones push
    if ('Notification' in window && Notification.permission === 'granted') {
      // Intentar mostrar notificación push
      try {
        new Notification('Nuevo gasto pendiente de aprobación', {
          body: `Concepto: ${expenseData.concept}\nMonto: $${expenseData.amount}\nUsuario: ${get().currentUser?.name || get().currentUser?.email || 'Desconocido'}`,
          icon: '/favicon.ico', // Puedes especificar un icono
          tag: 'pending-expense-' + Date.now()
        });
      } catch (error) {
        console.error('Error al mostrar notificación de escritorio:', error);
      }
    } else {
      // Mostrar alerta simple si no hay permisos para notificaciones push
      alert(`Nuevo gasto pendiente de aprobación: ${expenseData.concept} - Monto: $${expenseData.amount}`);
    }

    // Registrar también en la consola para propósitos de seguimiento
    console.log('Notificación de gasto pendiente:', expenseData);
  },

  approveExpense: async (expenseId) => {
    try {
      // Aprobar el gasto a través de la API
      await approveExpenseAPI(expenseId);

      // Recargar gastos para reflejar el cambio
      await get().loadExpenses();

      return { success: true };
    } catch (error) {
      console.error("Error approving expense:", error);
      return { success: false, error: error.message };
    }
  },

  updateExpense: async (expenseId, expenseData) => {
    try {
      // Actualizar el gasto a través de la API
      const updatedExpenseId = await updateExpenseAPI(expenseId, {
        ...expenseData,
        updated_at: new Date().toISOString()
      });

      // Recargar gastos para reflejar el cambio
      await get().loadExpenses();

      return { success: true, id: updatedExpenseId };
    } catch (error) {
      console.error("Error updating expense:", error);
      return { success: false, error: error.message };
    }
  },

  deleteExpense: async (expenseId) => {
    try {
      // Eliminar el gasto a través de la API
      await deleteExpenseAPI(expenseId);

      // Recargar gastos para reflejar el cambio
      await get().loadExpenses();

      return { success: true };
    } catch (error) {
      console.error("Error deleting expense:", error);
      return { success: false, error: error.message };
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
  // --- LÓGICA DE USUARIOS ---
  addUser: async (userData) => {
    const { password, name, email, ...userProperties } = userData;
    
    // Validaciones
    if (!name || name.trim() === '') {
      return { success: false, error: "El nombre es requerido" };
    }
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { success: false, error: "Email inválido" };
    }
    
    if (!password || password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
    }
    
    try {
      // Agregar el usuario a través de la API (esto creará tanto en Auth como en tabla personalizada)
      const userId = await addUserAPI(userData);

      // Recargar usuarios para reflejar el cambio
      await get().loadUsers();

      // Mostrar notificación de éxito
      notificationService.success(`Usuario ${name} creado exitosamente. El usuario recibirá un correo de confirmación.`);

      return { success: true, userId };
    } catch (error) {
      console.error("Error adding user:", error);
      alert(`Error al crear el usuario: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  updateUser: async (id, updatedData) => {
    const { password, name, email, ...userProperties } = updatedData;
    
    // Validaciones
    if (name && name.trim() === '') {
      return { success: false, error: "El nombre no puede estar vacío" };
    }
    
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return { success: false, error: "Email inválido" };
    }
    
    if (password && password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
    }
    
    try {
      // Actualizar los datos del usuario (sin la contraseña)
      await updateUserAPI(id, updatedData);

      // El manejo de la contraseña ya se realiza en updateUserAPI
      // Recargar usuarios para reflejar el cambio
      await get().loadUsers();

      // Mostrar notificación de éxito
      const { users } = get();
      const updatedUser = users.find(u => u.id === id);
      
      if (password) {
        const { currentUser } = get();
        if (currentUser?.id === id) {
          notificationService.success('Perfil actualizado exitosamente. Contraseña cambiada.');
        } else {
          notificationService.success(`Perfil de ${updatedUser?.name || 'usuario'} actualizado. Se ha enviado un correo de restablecimiento de contraseña.`);
        }
      } else {
        notificationService.success(`Perfil de ${updatedUser?.name || 'usuario'} actualizado exitosamente.`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Error al actualizar el usuario: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  deleteUser: async (id) => {
    try {
      // Eliminar el usuario a través de la API
      await deleteUserAPI(id);

      // Recargar usuarios para reflejar el cambio
      await get().loadUsers();

      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message };
    }
  },
  // --- LÓGICA DE PRODUCTOS ---
  addProduct: async (productData) => {
    try {
      // Agregar el producto a través de la API
      const productId = await addProductAPI({
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Recargar productos para reflejar el cambio
      await get().loadProducts();

      return { success: true, id: productId };
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false, error: error.message };
    }
  },
  updateProduct: async (id, updatedData) => {
    try {
      // Actualizar el producto a través de la API
      await updateProductAPI(id, updatedData);

      // Recargar productos para reflejar el cambio
      await get().loadProducts();

      return { success: true };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  },
  deleteProduct: async (id) => {
    try {
      // Eliminar el producto a través de la API
      await deleteProductAPI(id);

      // Recargar productos para reflejar el cambio
      await get().loadProducts();

      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }
  },
  // --- LÓGICA DE LOTES DE INVENTARIO ---
  addInventoryBatch: async (inventoryBatchData) => {
    try {
      // Agregar el lote de inventario a través de la API
      const result = await addInventoryBatchAPI({
        ...inventoryBatchData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Recargar lotes de inventario para reflejar el cambio
      await get().loadInventoryBatches();

      return { success: true, id: result };
    } catch (error) {
      console.error("Error adding inventory batch:", error);
      return { success: false, error: error.message };
    }
  },
  updateInventoryBatch: async (id, updatedData) => {
    try {
      // Actualizar el lote de inventario a través de la API
      await updateInventoryBatchAPI(id, updatedData);

      // Recargar lotes de inventario para reflejar el cambio
      await get().loadInventoryBatches();

      return { success: true };
    } catch (error) {
      console.error("Error updating inventory batch:", error);
      return { success: false, error: error.message };
    }
  },
  deleteInventoryBatch: async (id) => {
    try {
      // Eliminar el lote de inventario a través de la API
      await deleteInventoryBatchAPI(id);

      // Recargar lotes de inventario para reflejar el cambio
      await get().loadInventoryBatches();

      return { success: true };
    } catch (error) {
      console.error("Error deleting inventory batch:", error);
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
  // --- LÓGICA DE TRANSFERENCIAS ---
  loadTransfers: async () => {
    try {
      const offlineTransfers = await offlineStorage.getAllData('transfers');
      set({ transfers: offlineTransfers });
    } catch (error) {
      console.error("Error loading transfers from offline storage:", error);
      // Initialize with empty array if transfers store doesn't exist yet
      set({ transfers: [] });
    }
  },
  createTransfer: async (transferData) => {
    const { currentUser } = get();
    const newTransfer = {
      ...transferData,
      id: `TR-${Date.now()}`,
      requestedBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      status: 'solicitado',
      history: [{ status: 'solicitado', date: new Date().toISOString(), userId: currentUser.uid }],
    };
    try {
      await offlineStorage.updateData('transfers', newTransfer.id, newTransfer);
      set(state => ({
        transfers: [...state.transfers, newTransfer]
      }));
    } catch (error) {
      console.error("Error creating transfer:", error);
      throw error;
    }
  },
  confirmTransferShipment: async (transferId, sentItems) => {
    const { currentUser, transfers } = get();
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;

    const updatedTransfer = {
      ...transfer,
      status: 'enviado',
      items: transfer.items.map(item => {
        const sentItem = sentItems.find(si => si.productId === item.productId);
        return {
          ...item,
          sentQuantity: sentItem ? sentItem.quantity : 0,
        };
      }),
      history: [...transfer.history, { status: 'enviado', date: new Date().toISOString(), userId: currentUser.uid }],
    };

    try {
      await offlineStorage.updateData('transfers', transferId, updatedTransfer);
      set(state => ({
        transfers: state.transfers.map(t => t.id === transferId ? updatedTransfer : t)
      }));
    } catch (error) {
      console.error("Error confirming transfer shipment:", error);
      throw error;
    }
  },
  confirmTransferReception: async (transferId, receivedItems) => {
    const { currentUser, transfers } = get();
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;

    const updatedTransfer = {
      ...transfer,
      status: 'recibido',
      items: transfer.items.map(item => {
        const receivedItem = receivedItems.find(ri => ri.productId === item.productId);
        return {
          ...item,
          receivedQuantity: receivedItem ? receivedItem.quantity : 0,
        };
      }),
      history: [...transfer.history, { status: 'recibido', date: new Date().toISOString(), userId: currentUser.uid }],
    };

    try {
      await offlineStorage.updateData('transfers', transferId, updatedTransfer);
      set(state => ({
        transfers: state.transfers.map(t => t.id === transferId ? updatedTransfer : t)
      }));
    } catch (error) {
      console.error("Error confirming transfer reception:", error);
      throw error;
    }
  },

  addReminder: (reminderData) => {
    const newReminder = { ...reminderData, id: `rem-${Date.now()}`, isConcluded: false, createdAt: new Date().toISOString() };
    set(state => ({ reminders: [...state.reminders, newReminder] }));
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
          let assignedStoreName = 'Tienda no asignada';
          if (userDoc.storeId) {
            const assignedStore = await getStore(userDoc.storeId);
            if (assignedStore) {
              assignedStoreName = assignedStore.name;
            } else {
              console.warn(`Store with ID ${userDoc.storeId} not found for user ${userDoc.name}.`);
            }
          }

          set({
            currentUser: {
              ...userDoc,
              storeId: userDoc.storeId || userDoc.store_id,
              storeName: assignedStoreName,
            },
            currentView: userDoc.role === 'admin' || userDoc.role === 'gerente' ? 'admin-dashboard' : 'pos',
          });
          // App data will be loaded by components on demand.
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
        // Reset only non-essential data, catalogs will be cleared by pages themselves.
        discount: { type: 'none', value: 0 },
        note: '',
        lastSale: null,
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
  
        // TODO: Refactor checkAllAlerts to be a backend-driven process
        // get().checkAllAlerts();
        
        return { success: true, saleId: offlineSaleId, offline: true };
      }
  
      try {
        // Save the sale to Firebase
        const saleId = await addSaleAPI(saleDetails);
        
        // Update inventory batches in Supabase
        const updatePromises = updatedBatches.map(async (batch) => {
          // Only update batches whose quantity has changed
          const originalBatch = inventoryBatches.find(b => b.id === batch.id);
          if (originalBatch && originalBatch.quantity !== batch.quantity) {
            await updateInventoryBatchAPI(batch.id, { quantity: batch.quantity });
          }
        });
        await Promise.all(updatePromises);

        // Reload inventory after checkout to reflect the changes
        await get().loadInventoryBatches();
  
        // Update the state
        set({ 
          cart: [], 
          lastSale: { ...saleDetails, saleId }, // Add the generated sale ID
          salesHistory: [...get().salesHistory, { ...saleDetails, saleId }], // Add sale to history
          discount: { type: 'none', value: 0 }, // Reset discount after checkout
          note: '', // Reset note after checkout
        });
  
        // TODO: Refactor checkAllAlerts to be a backend-driven process
        // get().checkAllAlerts();
        
        return { success: true, saleId };
      } catch (error) {
        console.error("Error processing checkout:", error);
        return { success: false, error: error.message };
      }
    },

  // --- LÓGICA DE CONSUMO DE EMPLEADOS ---
  recordEmployeeConsumption: (productId, quantity) => {
    const { products, addExpense, updateProduct } = get();
    const product = products.find(p => p.id === productId);

    if (!product) {
      console.error(`Product with id ${productId} not found.`);
      return;
    }

    const consumptionCost = (product.cost || 0) * quantity;

    const expenseData = {
      date: new Date().toISOString(),
      description: `Consumo de empleado: ${quantity} x ${product.name}`,
      amount: consumptionCost,
      category: 'Egreso por Consumo',
      status: 'Aprobado' // Employee consumption is always approved
    };

    // Add the expense
    addExpense(expenseData);

    // Update product stock
    const newStock = (product.stock || 0) - quantity;
    updateProduct(productId, { stock: newStock });
  },

  // TODO: Refactor checkAllAlerts to be a backend-driven process.
  // This function currently relies on having all products and inventory in memory,
  // which is not scalable. This should be replaced with a server-side job or query.
  checkAllAlerts: async () => {
    console.warn("checkAllAlerts is temporarily disabled for performance reasons and needs to be refactored.");
    return;
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