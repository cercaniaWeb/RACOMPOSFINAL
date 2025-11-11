// src/lib/response-formatter.js
// Format data results into natural language responses

/**
 * Format sales report data into a natural language response
 * @param {object} data - Sales report data
 * @param {object} queryIntent - Query intent with parameters
 * @returns {string} - Natural language response
 */
function formatSalesResponse(data, queryIntent) {
  const { totalSales, transactionCount, itemsSold, dateRange, category } = data;
  
  const periodText = `${formatDate(dateRange.startDate)} a ${formatDate(dateRange.endDate)}`;
  const categoryText = category ? `de ${category}` : 'totales';
  
  const response = `El reporte ${categoryText} para el periodo del ${periodText} es:\n` +
    `- Total en ventas: $${totalSales.toFixed(2)}\n` +
    `- Número de transacciones: ${transactionCount}\n` +
    `- Cantidad de productos vendidos: ${itemsSold}`;
  
  return response;
}

/**
 * Format inventory report data into a natural language response
 * @param {object} data - Inventory report data
 * @param {object} queryIntent - Query intent with parameters
 * @returns {string} - Natural language response
 */
function formatInventoryResponse(data, queryIntent) {
  const { inventoryList, category, location, totalProducts } = data;
  
  const categoryText = category ? `para la categoría ${category}` : 'general';
  const locationText = location !== 'all' ? `en la ubicación ${location}` : 'en todas las ubicaciones';
  
  if (inventoryList.length === 0) {
    return `No se encontró inventario ${categoryText} ${locationText}.`;
  }
  
  let response = `Inventario ${categoryText} ${locationText}:\n`;
  response += `- Total de productos con stock: ${totalProducts}\n`;
  response += 'Productos con stock:\n';
  
  inventoryList.slice(0, 10).forEach(item => {
    response += `  * ${item.name}: ${item.totalQuantity} ${item.unit || 'unidades'}\n`;
  });
  
  if (inventoryList.length > 10) {
    response += `  ... y ${inventoryList.length - 10} productos más.\n`;
  }
  
  return response;
}

/**
 * Format sales comparison data into a natural language response
 * @param {object} data - Sales comparison data
 * @param {object} queryIntent - Query intent with parameters
 * @returns {string} - Natural language response
 */
function formatSalesComparisonResponse(data, queryIntent) {
  const { currentPeriod, previousPeriod, changePercent, category, periods } = data;
  
  const categoryText = category !== 'all' ? `de ${category}` : '';
  const currentPeriodText = `${formatDate(periods.current.startDate)} a ${formatDate(periods.current.endDate)}`;
  const previousPeriodText = `${formatDate(periods.previous.startDate)} a ${formatDate(periods.previous.endDate)}`;
  
  const trendText = changePercent > 0 ? 'aumentaron' : changePercent < 0 ? 'disminuyeron' : 'se mantuvieron';
  const changeText = `${Math.abs(changePercent).toFixed(2)}%`;
  
  const response = `Las ventas ${categoryText} han ${trendText} ${changeText} en comparación con el periodo anterior:\n` +
    `- Ventas en periodo actual (${currentPeriodText}): $${currentPeriod.toFixed(2)}\n` +
    `- Ventas en periodo anterior (${previousPeriodText}): $${previousPeriod.toFixed(2)}\n` +
    `- Cambio: ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
  
  return response;
}

/**
 * Format any report data based on the query intent
 * @param {object} data - Report data
 * @param {object} queryIntent - Query intent with parameters
 * @returns {string} - Natural language response
 */
function formatResponse(data, queryIntent) {
  switch (queryIntent.type) {
    case 'getSalesForCategory':
      return formatSalesResponse(data, queryIntent);
    case 'getInventoryReport':
      return formatInventoryResponse(data, queryIntent);
    case 'getSalesComparison':
      return formatSalesComparisonResponse(data, queryIntent);
    default:
      return 'Aquí tienes el reporte solicitado.';
  }
}

/**
 * Format date to a more readable format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

module.exports = {
  formatResponse
};