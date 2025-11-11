/**
 * @typedef {Object} TransferOrder
 * @property {string} id - The unique identifier for the transfer order.
 * @property {string} originLocationId - The ID of the origin location.
 * @property {string} destinationLocationId - The ID of the destination location.
 * @property {'solicitado' | 'enviado' | 'recibido'} status - The current status of the transfer order.
 * @property {Array<Object>} items - The items included in the transfer order.
 * @property {string} items.productId - The ID of the product.
 * @property {string} items.productName - The name of the product.
 * @property {number} items.requestedQuantity - The requested quantity of the product.
 * @property {number} items.sentQuantity - The sent quantity of the product.
 *
 * @property {number} items.receivedQuantity - The received quantity of the product.
 * @property {Array<Object>} history - The history of the transfer order's status changes.
 * @property {string} history.status - The status of the transfer order.
 * @property {string} history.date - The date of the status change.
 * @property {string} history.userId - The ID of the user who made the change.
 * @property {string} requestedBy - The ID of the user who requested the transfer.
 * @property {string} createdAt - The date the transfer was created.
 */

export const TransferOrderStatus = {
  SOLICITADO: 'solicitado',
  ENVIADO: 'enviado',
  RECIBIDO: 'recibido',
};
