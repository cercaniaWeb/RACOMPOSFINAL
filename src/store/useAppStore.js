import { create } from 'zustand';
import { 
  getProducts, 
  getProduct,
  addProduct, 
  updateProduct, 
  deleteProduct,
  getCategories, 
  addCategory, 
  updateCategory,
  getUsers,
  getUser,
  addUser,
  updateUser,
  getStores,
  getInventoryBatches,
  addInventoryBatch,
  updateInventoryBatch,
  deleteInventoryBatch,
  getSales,
  addSale,
  getClients,
  addClient,
  getTransfers,
  getShoppingList,
  getExpenses,
  getCashClosings,
  getSalesReport,
  initializeSupabaseCollections
} from '../utils/supabaseAPI';
import offlineStorage from '../utils/offlineStorage';
import { auth, supabase } from '../config/firebase';


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
            const saleId = await addSale(saleData);
            
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
        const users = await getUsers();
        set({ users });
        // Store in offline storage
        await Promise.all(users.map(user => 
          offlineStorage.updateData('users', user.id, user)
        ));
      } else {
        const offlineUsers = await offlineStorage.getAllData('users');
        set({ users: offlineUsers });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      try {
        const offlineUsers = await offlineStorage.getAllData('users');
        set({ users: offlineUsers });
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
      const clientId = await addClient({
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
  initialize: () => {
    set({
      products: localProducts,
      categories: localCategories,
      users: localUsers,
      stores: localStores,
      inventoryBatches: localInventoryBatches,
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
          currentUser: userDoc,
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
    const storeId = currentUser?.storeId;

    if (!storeId) {
      console.error("No store ID found for current user. Cannot add to cart.");
      return;
    }

    // For offline mode, we'll use the last known inventory
    let stockInLocation = 0;
    if (inventoryBatches && inventoryBatches.length > 0) {
      stockInLocation = inventoryBatches
        .filter(batch => batch.productId === product.id && batch.locationId === storeId)
        .reduce((sum, batch) => sum + batch.quantity, 0);
    } else {
      // If no inventory data is available (offline), allow adding to cart
      stockInLocation = Infinity;
    }

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
      const saleId = await addSale(saleDetails);
      
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

  approveTransfer: (transferId) => {
    set(state => ({
      transfers: state.transfers.map(t => 
        t.id === transferId 
        ? { 
            ...t, 
            status: 'aprobado', 
            history: [...t.history, { status: 'aprobado', date: new Date().toISOString(), userId: get().currentUser.uid }]
          } 
        : t
      )
    }));
  },

  shipTransfer: (transferId, sentItems) => {
    const { inventoryBatches } = get();
    let updatedBatches = JSON.parse(JSON.stringify(inventoryBatches));

    // Deduct stock from origin (bodega-central)
    for (const item of sentItems) {
      let quantityToDeduct = item.sentQuantity;
      const relevantBatches = updatedBatches
        .filter(b => b.productId === item.id && b.locationId === 'bodega-central')
        .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

      for (const batch of relevantBatches) {
        if (quantityToDeduct <= 0) break;
        const deductAmount = Math.min(quantityToDeduct, batch.quantity);
        batch.quantity -= deductAmount;
        quantityToDeduct -= deductAmount;
      }
    }

    set(state => ({
      inventoryBatches: updatedBatches.filter(b => b.quantity > 0),
      transfers: state.transfers.map(t => 
        t.id === transferId 
        ? { 
            ...t, 
            status: 'enviado', 
            items: t.items.map(origItem => {
              const sentItem = sentItems.find(si => si.productId === origItem.productId);
              return sentItem ? { ...origItem, sentQuantity: sentItem.sentQuantity } : origItem;
            }),
            history: [...t.history, { status: 'enviado', date: new Date().toISOString(), userId: get().currentUser.uid }]
          } 
        : t
      )
    }));
    get().checkAllAlerts();
  },

  receiveTransfer: (transferId, receivedItems) => {
    const { inventoryBatches } = get();
    let updatedBatches = JSON.parse(JSON.stringify(inventoryBatches));
    const transfer = get().transfers.find(t => t.id === transferId);
    const destinationId = transfer.destinationLocationId;

    // Add stock to destination
    for (const item of receivedItems) {
        // This is a simplified logic. A real system would need to decide if it merges with an existing batch
        // or creates a new one. For now, we create a new batch.
        const originalItem = transfer.items.find(i => i.productId === item.productId);
        updatedBatches.push({
            inventoryId: `inv-${Date.now()}-${item.productId}`,
            productId: item.productId,
            locationId: destinationId,
            quantity: item.receivedQuantity,
            cost: originalItem?.cost || 0, // This should be improved to get the real cost from the shipped batch
            expirationDate: '2027-12-31', // This should come from the shipped batch
        });
    }

    set(state => ({
      inventoryBatches: updatedBatches,
      transfers: state.transfers.map(t => 
        t.id === transferId 
        ? { 
            ...t, 
            status: 'recibido', 
            items: t.items.map(origItem => { 
              const receivedItem = receivedItems.find(ri => ri.productId === origItem.productId);
              return receivedItem ? { ...origItem, receivedQuantity: receivedItem.receivedQuantity } : origItem;
            }),
            history: [...t.history, { status: 'recibido', date: new Date().toISOString(), userId: get().currentUser.uid }]
          } 
        : t
      )
    }));
    get().checkAllAlerts();
  },

  // --- LÓGICA DE PRODUCTOS ---
  addProduct: async (productData) => {
    try {
      const { storeId, categoryId, subcategoryId, ...rest } = productData;
      
      // Add product to Firestore
      const productId = await addProduct({
        ...rest,
        categoryId,
        subcategoryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Add initial inventory batch to Firestore 
      await addInventoryBatch({
        productId: productId,
        locationId: storeId,
        quantity: 0, // Initial quantity is 0, it will be added later
        cost: rest.cost || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Reload products and inventory to reflect the changes
      await get().loadProducts();
      await get().loadInventoryBatches();
      
      return { success: true, id: productId };
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (id, updatedData) => {
    try {
      await updateProduct(id, {
        ...updatedData,
        updatedAt: new Date().toISOString()
      });

      // Reload products to reflect the changes
      await get().loadProducts();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  },

  deleteProduct: (id) => {
    set(state => ({
      products: state.products.filter(product => product.id !== id)
    }));
  },
  checkAllAlerts: () => {
    const { inventoryBatches, products, stores, alertSettings } = get();
    const newAlerts = [];

    // 1. Alertas de Stock Bajo
    stores.forEach(store => {
      products.forEach(product => {
        const totalStockInLocation = inventoryBatches
          .filter(batch => batch.productId === product.id && batch.locationId === store.id)
          .reduce((sum, batch) => sum + batch.quantity, 0);
        
        const threshold = product.minStockThreshold ? product.minStockThreshold[store.id] : undefined;

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
          const product = products.find(p => p.id === batch.productId);
          const store = stores.find(s => s.id === batch.locationId);
          newAlerts.push({
            id: `exp-${batch.inventoryId}`,
            type: 'Próxima Caducidad',
            message: `${batch.quantity} de ${product.name} en ${store.name} vencen el ${batch.expirationDate}.`,
            isRead: false,
          });
        }
      }
    });

    set({ alerts: newAlerts });
  },

  // Acción para marcar alerta como leída
  markAlertAsRead: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a),
    }));
  },

  // --- LÓGICA DE GASTOS ---
  addExpense: (expenseData) => {
    set(state => {
      let newExpenses = [];
      if (Array.isArray(expenseData)) {
        newExpenses = expenseData.map(item => ({
          id: `exp-${Date.now()}-${item.id}`,
          date: new Date().toISOString(),
          concept: item.name,
          amount: item.price * item.quantity,
          type: 'Compra Miscelánea',
          details: `Comprado desde lista de compras. Cantidad: ${item.quantity}`,
        }));
      } else {
        newExpenses.push({ ...expenseData, id: `exp-${Date.now()}`, date: new Date().toISOString() });
      }
      return { expenses: [...state.expenses, ...newExpenses] };
    });
  },
  // --- LÓGICA DE USUARIOS ---
  addUser: (userData) => {
    const newUser = { ...userData, uid: `user-${Date.now()}` };
    set(state => ({
      users: [...state.users, newUser]
    }));
  },

  updateUser: (uid, updatedData) => {
    set(state => ({
      users: state.users.map(user => user.uid === uid ? { ...user, ...updatedData } : user)
    }));
  },

  deleteUser: (uid) => {
    set(state => ({
      users: state.users.filter(user => user.uid !== uid)
    }));
  },

  // --- LÓGICA DE CATEGORÍAS ---
  addCategory: async (categoryData) => {
    try {
      // Add to Supabase first
      const newCategoryId = await addCategory(categoryData);
      
      // Reload categories to get the updated list with proper structure
      await get().loadCategories();
      
      return { success: true, id: newCategoryId };
    } catch (error) {
      console.error("Error adding category:", error);
      return { success: false, error: error.message };
    }
  },

  updateCategory: async (id, updatedData) => {
    try {
      // Update in Supabase
      await updateCategory(id, updatedData);
      
      // Reload categories to get the updated list
      await get().loadCategories();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating category:", error);
      return { success: false, error: error.message };
    }
  },

  deleteCategory: async (id) => {
    try {
      // Delete from Supabase
      const { data: { error } } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Also delete any subcategories of this category
      await supabase
        .from('categories')
        .delete()
        .eq('parent_id', id);
      
      // Reload categories to get the updated list
      await get().loadCategories();
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false, error: error.message };
    }
  },

  addInventoryBatch: async (inventoryData) => {
    try {
      const newInventoryBatchId = await addInventoryBatch(inventoryData);
      
      // Reload inventory batches to get the updated list
      await get().loadInventoryBatches();
      
      return { success: true, id: newInventoryBatchId };
    } catch (error) {
      console.error("Error adding inventory batch:", error);
      return { success: false, error: error.message };
    }
  },

  updateInventoryBatch: async (id, inventoryData) => {
    try {
      await updateInventoryBatch(id, inventoryData);
      
      // Reload inventory batches to get the updated list
      await get().loadInventoryBatches();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating inventory batch:", error);
      return { success: false, error: error.message };
    }
  },

  deleteInventoryBatch: async (id) => {
    try {
      await deleteInventoryBatch(id);
      
      // Reload inventory batches to get the updated list
      await get().loadInventoryBatches();
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting inventory batch:", error);
      return { success: false, error: error.message };
    }
  },

  handleCashClosing: (initialCash) => {
    const { salesHistory, currentUser } = get();
    const salesToClose = salesHistory.filter(sale => sale.cashier === currentUser.name);
    const totalSalesAmount = salesToClose.reduce((acc, sale) => acc + sale.total, 0);
    const totalCashSales = salesToClose.filter(sale => sale.cash).reduce((acc, sale) => acc + sale.cash, 0);
    const totalCardSales = salesToClose.filter(sale => sale.card).reduce((acc, sale) => acc + sale.card, 0);

    const cashClosing = {
      id: `cc-${Date.now()}`,
      date: new Date().toISOString(),
      cashier: currentUser.name,
      initialCash: initialCash,
      totalSalesAmount: totalSalesAmount,
      totalCashSales: totalCashSales,
      totalCardSales: totalCardSales,
      finalCash: initialCash + totalCashSales,
      sales: salesToClose,
    };
    set(state => ({
      cashClosings: [...state.cashClosings, cashClosing],
      salesHistory: state.salesHistory.filter(sale => sale.cashier !== currentUser.name),
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

  addUser: (userData) => {
    const newUser = { ...userData, uid: `user-${Date.now()}` };
    set(state => ({
      users: [...state.users, newUser]
    }));
  },

  updateUser: (uid, updatedData) => {
    set(state => ({
      users: state.users.map(user => user.uid === uid ? { ...user, ...updatedData } : user)
    }));
  },

  deleteUser: (uid) => {
    set(state => ({
      users: state.users.filter(user => user.uid !== uid)
    }));
  },

}));



export default useAppStore;