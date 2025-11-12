import { supabase } from '../config/supabase';

const DEFAULT_PAGE_SIZE = 50;

// Helper to transform snake_case to camelCase
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      // Keep original snake_case key for compatibility where needed
      if (camelKey !== key) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  }
  return obj;
};


// Funciones para productos
export const getProducts = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE, searchTerm = '' } = {}) => {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,barcode.eq.${searchTerm},sku.eq.${searchTerm}`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error obteniendo productos:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
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

  return toCamelCase(data);
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

  // Eliminar campos que no existen en la tabla de productos
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
  if ('inventoryData' in mappedProductData) {
    delete mappedProductData.inventoryData; // Este campo no existe en la base de datos
  }

  // Mapear nuevos campos que ahora sí existen en la tabla
  if ('supplierId' in mappedProductData) {
    mappedProductData.supplier_id = mappedProductData.supplierId;
    delete mappedProductData.supplierId;
  }
  if ('taxRate' in mappedProductData) {
    mappedProductData.tax_rate = mappedProductData.taxRate;
    delete mappedProductData.taxRate;
  }
  if ('isActive' in mappedProductData) {
    mappedProductData.is_active = mappedProductData.isActive;
    delete mappedProductData.isActive;
  }
  if ('minStockThreshold' in mappedProductData) {
    // Este campo ya existe como JSONB en la base de datos con nombre snake_case
    mappedProductData.min_stock_threshold = mappedProductData.minStockThreshold;
    delete mappedProductData.minStockThreshold;
  }
  // Los campos 'brand', 'weight', 'notes', 'tags' ya existen en la tabla con esos nombres

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
  if ('inventoryData' in mappedProductData) {
    delete mappedProductData.inventoryData; // Este campo no existe en la base de datos
  }

  // Mapear nuevos campos que ahora sí existen en la tabla
  if ('supplierId' in mappedProductData) {
    mappedProductData.supplier_id = mappedProductData.supplierId;
    delete mappedProductData.supplierId;
  }
  if ('taxRate' in mappedProductData) {
    mappedProductData.tax_rate = mappedProductData.taxRate;
    delete mappedProductData.taxRate;
  }
  if ('isActive' in mappedProductData) {
    mappedProductData.is_active = mappedProductData.isActive;
    delete mappedProductData.isActive;
  }
  if ('minStockThreshold' in mappedProductData) {
    // Este campo ya existe como JSONB en la base de datos con nombre snake_case
    mappedProductData.min_stock_threshold = mappedProductData.minStockThreshold;
    delete mappedProductData.minStockThreshold;
  }
  // Los campos 'brand', 'weight', 'notes', 'tags' ya existen en la tabla con esos nombres

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
// WARNING: This function fetches all categories to build a tree structure.
// If the number of categories becomes very large, this can cause performance issues.
// Consider refactoring to fetch categories on-demand or implementing a more scalable solution if needed.
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }

  const categoryMap = {};
  data.forEach(cat => {
    categoryMap[cat.id] = { ...toCamelCase(cat), subcategories: [] };
  });

  const tree = [];
  data.forEach(cat => {
    if (cat.parent_id && categoryMap[cat.parent_id]) {
      categoryMap[cat.parent_id].subcategories.push(categoryMap[cat.id]);
    } else {
      tree.push(categoryMap[cat.id]);
    }
  });

  return tree;
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
export const getUsers = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const { data, error, count } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);


  if (error) {
    console.error('Error obteniendo usuarios:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
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

  return toCamelCase(data);
};

export const addUser = async (userData) => {
  const { password, ...userProperties } = userData;

  // Si se proporciona una contraseña, crear el usuario en Supabase Auth
  if (password) {
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userProperties.email,
      password: password,
    });

    if (authError) {
      console.error('Error creando usuario en Supabase Auth:', authError);
      throw new Error(`Error creando usuario: ${authError.message}`);
    }

    // Extraer el ID del usuario recién creado
    const userId = authData.user?.id || authData.user.id;

    // Mapear campos de camelCase a snake_case para la base de datos
    const { storeId, ...otherProps } = userProperties;
    const userDataToInsert = {
      id: userId,  // Usar el ID de Supabase Auth
      ...otherProps,
      store_id: storeId || null, // Mapear a snake_case
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('users')
      .insert([userDataToInsert])
      .select()
      .single();

    if (error) {
      // Si falla la inserción en la tabla personalizada, eliminar el usuario de Auth
      await supabase.auth.admin.deleteUser(userId);
      console.error('Error agregando usuario a la tabla personalizada:', error);
      throw new Error(error.message);
    }

    return userId;
  } else {
    console.warn('Se intentó crear un usuario sin contraseña. Esto limitará su capacidad de inicio de sesión.');
    // Mapear campos de camelCase a snake_case para la base de datos
    const { storeId, ...otherProps } = userProperties;
    const userDataToInsert = {
      ...otherProps,
      store_id: storeId || null, // Mapear a snake_case
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert([userDataToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error agregando usuario:', error);
      throw new Error(error.message);
    }

    return data.id;
  }
};

// Función auxiliar para hacer hash de la contraseña (solo para fines de ejemplo)
// En un entorno de producción, deberías manejar la autenticación con Supabase Auth
const hashPassword = async (password) => {
  // Para fines de desarrollo, simplemente devolvemos la contraseña
  // En producción, usarías una librería como bcrypt
  return password;
};

export const updateUser = async (id, userData) => {
  const { password, ...userProperties } = userData;

  // Mapear campos de camelCase a snake_case para la base de datos
  const { storeId, ...otherProps } = userProperties;

  // Actualizar datos en la tabla personalizada (sin la contraseña)
  const updateData = {
    ...otherProps,
    store_id: storeId || null, // Mapear a snake_case
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando usuario:', error);
    throw new Error(error.message);
  }

  // Si se proporciona una nueva contraseña y es para el usuario actual, actualizarla
  if (password) {
    // Solo se permite cambiar la contraseña actual si es el mismo usuario
    // Para cambiar contraseña de otro usuario, se debe usar un proceso de backend
    // o enviar un correo de restablecimiento de contraseña
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user?.id === id) {
      // El usuario actual está actualizando su propia contraseña
      const { error: authError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (authError) {
        console.error("Error actualizando contraseña en Supabase Auth:", authError);
        throw authError; // Lanzar el error para que el UI lo maneje
      }
    } else {
      // Si es un admin intentando cambiar contraseña de otro usuario,
      // enviar un correo de restablecimiento de contraseña
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', id)
        .single();
      
      if (userData?.email) {
        // Enviar un correo de restablecimiento de contraseña
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(userData.email);
        if (resetError) {
          console.error("Error enviando correo de restablecimiento de contraseña:", resetError);
          // No lanzamos el error porque la actualización de datos principales ya se realizó
        } else {
          console.log("Correo de restablecimiento de contraseña enviado a:", userData.email);
        }
      } else {
        throw new Error("No se encontró el email del usuario para enviar correo de restablecimiento");
      }
    }
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

  return toCamelCase(data);
};

export const getStore = async (id) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error obteniendo tienda:', error);
    return null;
  }

  return toCamelCase(data);
};

// Funciones para lotes de inventario
export const getInventoryBatches = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const { data, error, count } = await supabase
    .from('inventory_batches')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error obteniendo lotes de inventario:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
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
    // Convert empty string to null for optional date fields
    mappedInventoryData.expiration_date = mappedInventoryData.expirationDate === '' ? null : mappedInventoryData.expirationDate;
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
    // Convert empty string to null for optional date fields
    mappedInventoryData.expiration_date = mappedInventoryData.expirationDate === '' ? null : mappedInventoryData.expirationDate;
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
export const getSales = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const { data, error, count } = await supabase
    .from('sales')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error obteniendo ventas:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
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
export const getClients = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const { data, error, count } = await supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error obteniendo clientes:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
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
export const getTransfers = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const { data, error, count } = await supabase
    .from('transfers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error obteniendo transferencias:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
};

// Funciones para proveedores
export const getSuppliers = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const { data, error, count } = await supabase
    .from('suppliers')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error obteniendo proveedores:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
};

export const addSupplier = async (supplierData) => {
  const { data, error } = await supabase
    .from('suppliers')
    .insert([{
      ...supplierData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando proveedor:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateSupplier = async (id, supplierData) => {
  const { error } = await supabase
    .from('suppliers')
    .update({
      ...supplierData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error actualizando proveedor:', error);
    throw new Error(error.message);
  }
};

export const deleteSupplier = async (id) => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando proveedor:', error);
    throw new Error(error.message);
  }
};

// Funciones para lista de compras
export const getShoppingList = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const { data, error, count } = await supabase
    .from('shopping_list')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error obteniendo lista de compras:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
};

// Funciones para gastos
export const getExpenses = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const { data, error, count } = await supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error obteniendo gastos:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
};

export const addExpense = async (expenseData) => {
  // Mapear campos del formulario a los campos correctos de la base de datos
  const mappedExpenseData = { ...expenseData };

  // Mapear campos si existen
  if ('storeId' in mappedExpenseData) {
    mappedExpenseData.store_id = mappedExpenseData.storeId;
    delete mappedExpenseData.storeId;
  }
  if ('createdBy' in mappedExpenseData) {
    mappedExpenseData.created_by = mappedExpenseData.createdBy;
    delete mappedExpenseData.createdBy;
  }

  // Asegurar que los campos monetarios sean números válidos
  if (mappedExpenseData.amount !== undefined) {
    mappedExpenseData.amount = parseFloat(mappedExpenseData.amount) || 0;
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      ...mappedExpenseData,
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando gasto:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const approveExpense = async (expenseId) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString()
    })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) {
    console.error('Error aprobando gasto:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateExpense = async (expenseId, expenseData) => {
  // Mapear campos del formulario a los campos correctos de la base de datos
  const mappedExpenseData = { ...expenseData };

  // Eliminar campos que no existen en la tabla expenses
  if ('createdAt' in mappedExpenseData) {
    delete mappedExpenseData.createdAt; // No existe en la tabla real
  }
  if ('created_at' in mappedExpenseData) {
    delete mappedExpenseData.created_at; // Ya se establece automáticamente
  }

  // Mapear campos si existen
  if ('storeId' in mappedExpenseData) {
    mappedExpenseData.store_id = mappedExpenseData.storeId;
    delete mappedExpenseData.storeId;
  }
  if ('createdBy' in mappedExpenseData) {
    mappedExpenseData.created_by = mappedExpenseData.createdBy;
    delete mappedExpenseData.createdBy;
  }

  // Asegurar que los campos monetarios sean números válidos
  if (mappedExpenseData.amount !== undefined) {
    mappedExpenseData.amount = parseFloat(mappedExpenseData.amount) || 0;
  }

  const { data, error } = await supabase
    .from('expenses')
    .update({
      ...mappedExpenseData,
      updated_at: new Date().toISOString()
    })
    .eq('id', expenseId)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando gasto:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const deleteExpense = async (expenseId) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    console.error('Error eliminando gasto:', error);
    throw new Error(error.message);
  }

  return expenseId;
};

// Funciones para reportes de ventas
// NOTE: This function still fetches all sales within the date range.
// For very high volume sales, this could still be a performance issue.
// A better long-term solution would be to create a database function (RPC)
// to perform the aggregation on the server.
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
export const getCashClosings = async ({ page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) => {
  const { data, error, count } = await supabase
    .from('cash_closings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error obteniendo cierres de caja:', error);
    return { data: [], count: 0 };
  }

  return { data: toCamelCase(data), count };
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
      .select('id')
      .limit(1);

    if (categoriesError) {
      console.error('Error obteniendo categorías:', categoriesError);
    } else if (!categories || categories.length === 0) {
      console.log('No categories found, creating default ones...');
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
      .select('id')
      .limit(1);

    if (storesError) {
      console.error('Error obteniendo tiendas:', storesError);
    } else if (!stores || stores.length === 0) {
      console.log('No stores found, creating default ones...');
      // Agregar tiendas por defecto
      const defaultStores = [
        { id: 'bodega-central', name: 'Bodega Central' },
        { id: 'tienda1', name: 'Tienda 1' },
        { id: 'tienda2', name: 'Tienda 2' }
      ];

      for (const store of defaultStores) {
        try {
          await supabase
            .from('stores')
            .insert([{
              ...store,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
        } catch (err) {
          console.error(`Error agregando tienda por defecto '${store.id}':`, err);
        }
      }
    }
  } catch (error) {
    console.error('Error inicializando colecciones de Supabase:', error);
    throw error;
  }
};