import { supabase } from '../config/supabase';

// Funciones para productos
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }

  return data;
};

export const getProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error obteniendo producto:', error);
    return null;
  }

  return data;
};

export const addProduct = async (productData) => {
  // Copiar los datos del producto sin modificar el original
  const mappedProductData = { ...productData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('categoryId' in mappedProductData) {
    mappedProductData.category_id = mappedProductData.categoryId;
    delete mappedProductData.categoryId;
  }
  if ('subcategoryId' in mappedProductData) {
    mappedProductData.subcategory_id = mappedProductData.subcategoryId;
    delete mappedProductData.subcategoryId;
  }
  if ('unitOfMeasure' in mappedProductData) {
    mappedProductData.unit = mappedProductData.unitOfMeasure;
    delete mappedProductData.unitOfMeasure;
  }
  if ('image' in mappedProductData) {
    mappedProductData.image_url = mappedProductData.image;
    delete mappedProductData.image;
  }
  if ('expirationDate' in mappedProductData) {
    delete mappedProductData.expirationDate; // Este campo no existe en la base de datos de productos
  }
  if ('createdAt' in mappedProductData) {
    delete mappedProductData.createdAt; // Eliminar, ya que se establece automáticamente
  }
  if ('updatedAt' in mappedProductData) {
    delete mappedProductData.updatedAt; // Eliminar, ya que se establece automáticamente
  }
  if ('created_at' in mappedProductData) {
    delete mappedProductData.created_at; // Eliminar, ya que se establece automáticamente
  }
  if ('updated_at' in mappedProductData) {
    delete mappedProductData.updated_at; // Eliminar, ya que se establece automáticamente
  }
  if ('wholesalePrice' in mappedProductData) {
    delete mappedProductData.wholesalePrice; // Este campo no existe en la base de datos
  }

  // Agregar campos automáticos
  mappedProductData.created_at = new Date().toISOString();
  mappedProductData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('products')
    .insert([mappedProductData])
    .select('id')
    .single();

  if (error) {
    console.error('Error agregando producto:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateProduct = async (id, productData) => {
  // Copiar los datos del producto sin modificar el original
  const mappedProductData = { ...productData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('categoryId' in mappedProductData) {
    mappedProductData.category_id = mappedProductData.categoryId;
    delete mappedProductData.categoryId;
  }
  if ('subcategoryId' in mappedProductData) {
    mappedProductData.subcategory_id = mappedProductData.subcategoryId;
    delete mappedProductData.subcategoryId;
  }
  if ('unitOfMeasure' in mappedProductData) {
    mappedProductData.unit = mappedProductData.unitOfMeasure;
    delete mappedProductData.unitOfMeasure;
  }
  if ('image' in mappedProductData) {
    mappedProductData.image_url = mappedProductData.image;
    delete mappedProductData.image;
  }
  if ('expirationDate' in mappedProductData) {
    delete mappedProductData.expirationDate; // Este campo no existe en la base de datos de productos
  }
  if ('createdAt' in mappedProductData) {
    delete mappedProductData.createdAt; // No se actualiza en ediciones
  }
  if ('updatedAt' in mappedProductData) {
    delete mappedProductData.updatedAt; // No se envía, se gestiona automáticamente
  }
  if ('created_at' in mappedProductData) {
    delete mappedProductData.created_at; // No se actualiza en ediciones
  }
  if ('updated_at' in mappedProductData) {
    delete mappedProductData.updated_at; // No se envía, se gestiona automáticamente
  }
  if ('wholesalePrice' in mappedProductData) {
    delete mappedProductData.wholesalePrice; // Este campo no existe en la base de datos
  }

  // Actualizar el campo updated_at
  mappedProductData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('products')
    .update(mappedProductData)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando producto:', error);
    throw new Error(error.message);
  }
};

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando producto:', error);
    throw new Error(error.message);
  }
};

// Funciones para categorías
export const getCategories = async () => {
  // First get all categories
  const { data: allCategories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (categoriesError) {
    console.error('Error obteniendo categorías:', categoriesError);
    return [];
  }

  // Build the hierarchical structure
  const categoriesWithSubcategories = allCategories.map(category => {
    // Convert snake_case to camelCase for consistency
    return {
      id: category.id,
      name: category.name,
      parentId: category.parent_id,
      parent_id: category.parent_id,
      created_at: category.created_at,
      updated_at: category.updated_at
    };
  });

  // Build the tree structure
  const categoriesTree = [];
  const categoryMap = {};

  // Create a map of categories for easier lookup
  categoriesWithSubcategories.forEach(cat => {
    categoryMap[cat.id] = { ...cat, subcategories: [] };
  });

  // Build the tree
  categoriesWithSubcategories.forEach(cat => {
    if (cat.parentId) {
      // This is a subcategory
      const parent = categoryMap[cat.parentId];
      if (parent) {
        parent.subcategories.push(categoryMap[cat.id]);
      }
    } else {
      // This is a main category
      categoriesTree.push(categoryMap[cat.id]);
    }
  });

  return categoriesTree;
};

export const addCategory = async (categoryData) => {
  // Convert camelCase to snake_case for database
  const dbData = { ...categoryData };
  if ('parentId' in dbData) {
    dbData.parent_id = dbData.parentId;
    delete dbData.parentId;
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{
      ...dbData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (error) {
    console.error('Error agregando categoría:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateCategory = async (id, categoryData) => {
  // Convert camelCase to snake_case for database
  const dbData = { ...categoryData };
  if ('parentId' in dbData) {
    dbData.parent_id = dbData.parentId;
    delete dbData.parentId;
  }

  const { error } = await supabase
    .from('categories')
    .update({
      ...dbData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error actualizando categoría:', error);
    throw new Error(error.message);
  }
};

// Funciones para usuarios
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }

  return data;
};

export const getUser = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }

  return data;
};

export const addUser = async (userData) => {
  // Copiar los datos del usuario sin el password para evitar conflictos
  const { password, ...userProperties } = userData;
  
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...userProperties,
      password_hash: password ? await hashPassword(password) : null, // Si se proporciona contraseña, hacer hash
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando usuario:', error);
    throw new Error(error.message);
  }

  return data.id;
};

// Función auxiliar para hacer hash de la contraseña (solo para fines de ejemplo)
// En un entorno de producción, deberías manejar la autenticación con Supabase Auth
const hashPassword = async (password) => {
  // Para fines de desarrollo, simplemente devolvemos la contraseña
  // En producción, usarías una librería como bcrypt
  return password;
};

export const updateUser = async (id, userData) => {
  // Copiar los datos del usuario sin el password para evitar conflictos
  const { password, ...userProperties } = userData;
  
  const updateData = {
    ...userProperties,
    updated_at: new Date().toISOString()
  };
  
  // Si se proporciona una contraseña, agregarla al hash
  if (password) {
    updateData.password_hash = await hashPassword(password);
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando usuario:', error);
    throw new Error(error.message);
  }
};

export const deleteUser = async (id) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando usuario:', error);
    throw new Error(error.message);
  }
};

// Funciones para tiendas
export const getStores = async () => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo tiendas:', error);
    return [];
  }

  return data;
};

// Funciones para lotes de inventario
export const getInventoryBatches = async () => {
  const { data, error } = await supabase
    .from('inventory_batches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo lotes de inventario:', error);
    return [];
  }

  return data;
};

export const addInventoryBatch = async (inventoryData) => {
  // Mapear campos del formulario a los campos correctos de la base de datos
  const mappedInventoryData = { ...inventoryData };
  
  // Eliminar campos que no existen en la tabla inventory_batches
  if ('createdAt' in mappedInventoryData) {
    delete mappedInventoryData.createdAt; // No existe en la tabla real
  }
  if ('updatedAt' in mappedInventoryData) {
    delete mappedInventoryData.updatedAt; // No existe en la tabla real
  }
  if ('created_at' in mappedInventoryData) {
    delete mappedInventoryData.created_at; // Ya se establece automáticamente
  }
  if ('updated_at' in mappedInventoryData) {
    delete mappedInventoryData.updated_at; // Ya se establece automáticamente
  }
  
  // Mapear campos si existen
  if ('productId' in mappedInventoryData) {
    mappedInventoryData.product_id = mappedInventoryData.productId;
    delete mappedInventoryData.productId;
  }
  if ('locationId' in mappedInventoryData) {
    mappedInventoryData.location_id = mappedInventoryData.locationId;
    delete mappedInventoryData.locationId;
  }
  if ('expirationDate' in mappedInventoryData) {
    mappedInventoryData.expiration_date = mappedInventoryData.expirationDate;
    delete mappedInventoryData.expirationDate;
  }
  if ('cost' in mappedInventoryData) {
    mappedInventoryData.cost = parseFloat(mappedInventoryData.cost) || 0;
  }
  if ('quantity' in mappedInventoryData) {
    mappedInventoryData.quantity = parseInt(mappedInventoryData.quantity) || 0;
  }

  const { data, error } = await supabase
    .from('inventory_batches')
    .insert([{
      ...mappedInventoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando lote de inventario:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateInventoryBatch = async (id, inventoryData) => {
  // Mapear campos del formulario a los campos correctos de la base de datos
  const mappedInventoryData = { ...inventoryData };
  
  // Eliminar campos que no existen en la tabla inventory_batches
  if ('createdAt' in mappedInventoryData) {
    delete mappedInventoryData.createdAt; // No existe en la tabla real
  }
  if ('updatedAt' in mappedInventoryData) {
    delete mappedInventoryData.updatedAt; // No existe en la tabla real
  }
  if ('created_at' in mappedInventoryData) {
    delete mappedInventoryData.created_at; // No se actualiza
  }
  if ('updated_at' in mappedInventoryData) {
    delete mappedInventoryData.updated_at; // Ya se actualiza automáticamente
  }
  
  // Mapear campos si existen
  if ('productId' in mappedInventoryData) {
    mappedInventoryData.product_id = mappedInventoryData.productId;
    delete mappedInventoryData.productId;
  }
  if ('locationId' in mappedInventoryData) {
    mappedInventoryData.location_id = mappedInventoryData.locationId;
    delete mappedInventoryData.locationId;
  }
  if ('expirationDate' in mappedInventoryData) {
    mappedInventoryData.expiration_date = mappedInventoryData.expirationDate;
    delete mappedInventoryData.expirationDate;
  }
  if ('cost' in mappedInventoryData) {
    mappedInventoryData.cost = parseFloat(mappedInventoryData.cost) || 0;
  }
  if ('quantity' in mappedInventoryData) {
    mappedInventoryData.quantity = parseInt(mappedInventoryData.quantity) || 0;
  }

  const { error } = await supabase
    .from('inventory_batches')
    .update({
      ...mappedInventoryData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error actualizando lote de inventario:', error);
    throw new Error(error.message);
  }
};

export const deleteInventoryBatch = async (id) => {
  const { error } = await supabase
    .from('inventory_batches')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando lote de inventario:', error);
    throw new Error(error.message);
  }
};

// Funciones para ventas
export const getSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error obteniendo ventas:', error);
    return [];
  }

  return data;
};

export const addSale = async (saleData) => {
  // Mapear campos del formulario a los campos correctos de la base de datos
  const mappedSaleData = { ...saleData };

  // Mapear campos si existen
  if ('storeId' in mappedSaleData) {
    mappedSaleData.store_id = mappedSaleData.storeId;
    delete mappedSaleData.storeId;
  }

  // Convertir posibles valores booleanos a numéricos para campos monetarios
  if (typeof mappedSaleData.cash === 'boolean') {
    mappedSaleData.cash = mappedSaleData.cash ? 0 : 0;
  }
  if (typeof mappedSaleData.card === 'boolean') {
    mappedSaleData.card = mappedSaleData.card ? 0 : 0;
  }
  if (typeof mappedSaleData.cardCommission === 'boolean') {
    mappedSaleData.cardCommission = mappedSaleData.cardCommission ? 0 : 0;
  }
  if (typeof mappedSaleData.commissionInCash === 'boolean') {
    mappedSaleData.commissionInCash = mappedSaleData.commissionInCash ? 1 : 0;
  }

  // Asegurar que los campos monetarios sean números válidos
  if (mappedSaleData.cash === undefined || mappedSaleData.cash === null || mappedSaleData.cash === false) {
    mappedSaleData.cash = 0;
  }
  if (mappedSaleData.card === undefined || mappedSaleData.card === null || mappedSaleData.card === false) {
    mappedSaleData.card = 0;
  }
  if (mappedSaleData.cardCommission === undefined || mappedSaleData.cardCommission === null || mappedSaleData.cardCommission === false) {
    mappedSaleData.cardCommission = 0;
  }

  const { data, error } = await supabase
    .from('sales')
    .insert([{
      ...mappedSaleData,
      date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando venta:', error);
    throw new Error(error.message);
  }

  return data.id;
};

// Funciones para clientes
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo clientes:', error);
    return [];
  }

  return data;
};

export const addClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      ...clientData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando cliente:', error);
    throw new Error(error.message);
  }

  return data.id;
};

// Funciones para transferencias
export const getTransfers = async () => {
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo transferencias:', error);
    return [];
  }

  return data;
};

// Funciones para lista de compras
export const getShoppingList = async () => {
  const { data, error } = await supabase
    .from('shopping_list')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo lista de compras:', error);
    return [];
  }

  return data;
};

// Funciones para gastos
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo gastos:', error);
    return [];
  }

  return data;
};

// Funciones para reportes de ventas
export const getSalesReport = async (startDate, endDate, storeId = null, reportType = 'daily') => {
  let query = supabase
    .from('sales')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (storeId) {
    query = query.eq('storeId', storeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error obteniendo reporte de ventas:', error);
    return null;
  }

  // Procesar los datos según el tipo de reporte
  const processedData = processSalesReportData(data, reportType, startDate, endDate);

  return processedData;
};

// Función auxiliar para procesar los datos del reporte
const processSalesReportData = (sales, reportType, startDate, endDate) => {
  if (!sales || sales.length === 0) {
    return {
      totalSales: 0,
      totalTransactions: 0,
      avgTicket: 0,
      profitMargin: 0,
      sales: [],
      dateRange: { startDate, endDate }
    };
  }

  // Agrupar ventas por período según reportType
  const groupedSales = {};
  
  sales.forEach(sale => {
    // Parsear la fecha de la venta y formatear según el tipo de agrupamiento
    const saleDate = new Date(sale.date);
    let periodKey;
    
    switch(reportType) {
      case 'daily':
        periodKey = saleDate.toISOString().split('T')[0];
        break;
      case 'weekly':
        // Calcular la semana del año
        const startOfWeek = new Date(saleDate);
        startOfWeek.setDate(saleDate.getDate() - saleDate.getDay()); // Lunes de la semana
        periodKey = startOfWeek.toISOString().split('T')[0];
        break;
      case 'monthly':
        periodKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        periodKey = saleDate.toISOString().split('T')[0];
    }
    
    if (!groupedSales[periodKey]) {
      groupedSales[periodKey] = {
        date: periodKey,
        store: sale.storeId || 'Desconocido',
        transactions: 0,
        salesAmount: 0,
        costAmount: 0,
        profitAmount: 0,
        profitMargin: 0
      };
    }
    
    // Asumimos que tenemos información de productos en cada línea de venta para calcular costos
    // Por ahora usamos el total como proxy
    groupedSales[periodKey].transactions += 1;
    groupedSales[periodKey].salesAmount += sale.total || 0;
    
    // Estos valores requerirían más información detallada de los productos vendidos
    // Por ahora usamos cálculos estimados
    groupedSales[periodKey].costAmount += sale.total ? sale.total * 0.7 : 0; // Suponiendo un 70% de costo
    groupedSales[periodKey].profitAmount += sale.total ? sale.total * 0.3 : 0; // Suponiendo un 30% de ganancia
  });
  
  // Calcular el margen de ganancia para cada período
  Object.values(groupedSales).forEach(sale => {
    sale.profitMargin = sale.salesAmount > 0 ? (sale.profitAmount / sale.salesAmount) * 100 : 0;
  });

  // Calcular métricas generales
  const totalSales = Object.values(groupedSales).reduce((sum, s) => sum + s.salesAmount, 0);
  const totalTransactions = Object.values(groupedSales).reduce((sum, s) => sum + s.transactions, 0);
  const avgTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  const overallProfitMargin = totalSales > 0 ? (Object.values(groupedSales).reduce((sum, s) => sum + s.profitAmount, 0) / totalSales) * 100 : 0;

  return {
    totalSales,
    totalTransactions,
    avgTicket,
    profitMargin: overallProfitMargin,
    sales: Object.values(groupedSales).sort((a, b) => new Date(a.date) - new Date(b.date)),
    dateRange: { startDate, endDate }
  };
};

// Funciones para cierres de caja
export const getCashClosings = async () => {
  const { data, error } = await supabase
    .from('cash_closings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo cierres de caja:', error);
    return [];
  }

  return data;
};

export const addCashClosing = async (cashClosingData) => {
  // Add timestamp
  const dataToInsert = {
    ...cashClosingData,
    created_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('cash_closings')
    .insert([dataToInsert])
    .select();

  if (error) {
    console.error('Error guardando cierre de caja:', error);
    throw error;
  }

  return data[0];
};

// Inicializar colecciones/tablas por defecto si no existen
export const initializeSupabaseCollections = async () => {
  try {
    // Verificar si existen categorías y agregar por defecto si no hay
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('Error obteniendo categorías:', categoriesError);
    } else if (!categories || categories.length === 0) {
      // Agregar categorías por defecto
      const defaultCategories = [
        { name: 'Abarrotes', parent_id: null },
        { name: 'Vicio', parent_id: null },
        { name: 'Bebidas', parent_id: null }
      ];

      for (const cat of defaultCategories) {
        try {
          await addCategory({
            ...cat,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (err) {
          console.error('Error agregando categoría por defecto:', err);
        }
      }
    }

    // Verificar si existen tiendas y agregar por defecto si no hay
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*');

    if (storesError) {
      console.error('Error obteniendo tiendas:', storesError);
    } else if (!stores || stores.length === 0) {
      // Agregar tiendas por defecto
      const defaultStores = [
        { id: 'bodega-central', name: 'Bodega Central' },
        { id: 'tienda1', name: 'Tienda 1' },
        { id: 'tienda2', name: 'Tienda 2' }
      ];

      for (const store of defaultStores) {
        try {
          const { error } = await supabase
            .from('stores')
            .insert([{
              ...store,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (error) {
            console.error('Error agregando tienda por defecto:', error);
          }
        } catch (err) {
          console.error('Error agregando tienda por defecto:', err);
        }
      }
    }
  } catch (error) {
    console.error('Error inicializando colecciones de Supabase:', error);
  }
};