import React, { useState, useRef, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ProductFormModal from '../products/ProductFormModal';
import InventoryBatchFormModal from '../inventory/InventoryBatchFormModal';
import { Plus, Trash2, Check, ExternalLink } from 'lucide-react';

const MiscellaneousPurchaseModal = ({ onClose }) => {
  console.log("MiscellaneousPurchaseModal: Component rendering."); // Top-level log

  const shoppingList = useAppStore(state => state.shoppingList);
  const addToShoppingList = useAppStore(state => state.addToShoppingList);
  const updateShoppingListItem = useAppStore(state => state.updateShoppingListItem);
  const removeShoppingListItem = useAppStore(state => state.removeShoppingListItem);
  const generateExpenseFromShoppingList = useAppStore(state => state.generateExpenseFromShoppingList);
  const addProduct = useAppStore(state => state.addProduct); // Needed for promoting to product
  const addInventoryBatch = useAppStore(state => state.addInventoryBatch); // Needed for initial batch after promoting

  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemExpectedCost, setNewItemExpectedCost] = useState(0);
  const [showProductFormModal, setShowProductFormModal] = useState(false);
  const [productToPromote, setProductToPromote] = useState(null);
  const [showInventoryBatchModal, setShowInventoryBatchModal] = useState(false);
  const [batchForNewProduct, setBatchForNewProduct] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const newItemDescriptionRef = useRef(null);

  // Debugging useEffect to log shoppingList changes
  useEffect(() => {
    console.log("MiscellaneousPurchaseModal: shoppingList updated:", shoppingList);
  }, [shoppingList]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItemDescription.trim()) {
      addToShoppingList(newItemDescription.trim(), parseFloat(newItemExpectedCost) || 0);
      setNewItemDescription('');
      setNewItemExpectedCost(0);
      newItemDescriptionRef.current.focus();
      console.log("Item added to shopping list:", { description: newItemDescription.trim(), expectedCost: parseFloat(newItemExpectedCost) || 0 });
    }
  };

  const handleUpdateItem = (id, field, value) => {
    let parsedValue = value;
    if (field === 'actualCost') {
      parsedValue = parseFloat(value) || 0;
    }
    console.log("Updating item:", id, field, parsedValue);
    updateShoppingListItem(id, { [field]: parsedValue });
  };

  const handleRemoveItem = (id) => {
    console.log("Removing item:", id);
    removeShoppingListItem(id);
  };

  const handleGenerateExpense = async () => {
    console.log("Attempting to generate expense from shopping list...");
    const result = await generateExpenseFromShoppingList();
    if (result.success) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        onClose(); // Close modal after successful expense generation
      }, 2000);
    } else {
      alert(result.message);
    }
  };

  const handlePromoteToProduct = (item) => {
    console.log("Promoting item to product:", item);
    setProductToPromote({
      name: item.description,
      cost: item.actualCost > 0 ? item.actualCost : item.expectedCost,
      price: (item.actualCost > 0 ? item.actualCost : item.expectedCost) * 1.2, // Suggest 20% markup
      unit: 'unidad', // Default unit
      categoryId: '', // User will select
      subcategoryId: '', // User will select
      minStockThreshold: { '1': 0 }, // Default for store 1
    });
    setShowProductFormModal(true);
  };

  const handleProductCreated = async (newProductData) => {
    console.log("Product created:", newProductData);
    try {
      const result = await addProduct(newProductData);
      if (result.success) {
        // Now prompt to add an initial inventory batch for this new product
        setBatchForNewProduct({
          productId: result.id,
          locationId: '', // User will select
          quantity: 0, // User will input
          cost: newProductData.cost,
          expirationDate: '',
        });
        setShowInventoryBatchModal(true);
        setShowProductFormModal(false); // Close product form
      } else {
        alert(`Error al crear el producto: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating product from shopping list:", error);
      alert("Error al crear el producto.");
    }
  };

  const handleBatchAdded = async (batchData) => {
    console.log("Batch added for new product:", batchData);
    try {
      const result = await addInventoryBatch(batchData);
      if (result.success) {
        alert("Producto y lote de inventario agregados exitosamente.");
        setShowInventoryBatchModal(false); // Close batch form
        onClose(); // Close main modal
      } else {
        alert(`Error al agregar el lote de inventario: ${result.error}`);
      }
    } catch (error) {
      console.error("Error adding inventory batch for new product:", error);
      alert("Error al agregar el lote de inventario.");
    }
  };

  const totalPurchasedAmount = shoppingList
    .filter(item => item.isPurchased)
    .reduce((sum, item) => sum + (parseFloat(item.actualCost) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Lista de Compras y Gestión de Gastos</h2>

      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">¡Éxito!</strong>
          <span className="block sm:inline"> Gasto generado y lista actualizada.</span>
        </div>
      )}

      {/* Section to add new items to the shopping list */}
      <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2 mb-6">
        <Input
          ref={newItemDescriptionRef}
          type="text"
          placeholder="Descripción del artículo"
          value={newItemDescription}
          onChange={(e) => setNewItemDescription(e.target.value)}
          className="flex-grow"
          required
        />
        <Input
          type="number"
          placeholder="Costo Estimado (opcional)"
          value={newItemExpectedCost}
          onChange={(e) => setNewItemExpectedCost(e.target.value)}
          step="0.01"
          min="0"
          className="w-full sm:w-auto"
        />
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Añadir a Lista
        </Button>
      </form>

      {/* Shopping List Display */}
      {shoppingList.length === 0 ? (
        <p className="text-gray-600">La lista de compras está vacía.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Estimado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Pagado (real)</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Comprado</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shoppingList.map(item => (
                <tr key={item.id} className={item.isPurchased ? 'bg-green-50 bg-opacity-50' : ''}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    ${item.expectedCost ? item.expectedCost.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    <Input
                      type="number"
                      value={item.actualCost}
                      onChange={(e) => handleUpdateItem(item.id, 'actualCost', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      className="w-24 text-sm"
                      disabled={item.isPurchased}
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                    <input
                      type="checkbox"
                      checked={item.isPurchased}
                      onChange={(e) => handleUpdateItem(item.id, 'isPurchased', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        onClick={() => handlePromoteToProduct(item)}
                        className="p-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                        title="Crear Producto"
                        disabled={item.isProduct}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 bg-red-100 text-red-700 hover:bg-red-200"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <p className="text-lg font-bold text-gray-800">Total de Compras Marcadas: ${totalPurchasedAmount.toFixed(2)}</p>
        <Button 
          onClick={handleGenerateExpense} 
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={totalPurchasedAmount === 0}
        >
          <Check className="w-4 h-4 mr-2" /> Generar Gasto
        </Button>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white">
          Cerrar
        </Button>
      </div>

      {/* Product Form Modal for promoting an item */}
      <Modal 
        isOpen={showProductFormModal}
        title="Crear Nuevo Producto desde Lista de Compras" 
        onClose={() => setShowProductFormModal(false)}
      >
        <ProductFormModal 
          product={productToPromote} 
          onClose={() => setShowProductFormModal(false)} 
          onSave={handleProductCreated}
        />
      </Modal>

      {/* Inventory Batch Form Modal for initial batch of new product */}
      <Modal 
        isOpen={showInventoryBatchModal}
        title="Agregar Lote Inicial para Nuevo Producto" 
        onClose={() => setShowInventoryBatchModal(false)}
      >
        <InventoryBatchFormModal 
          batch={batchForNewProduct} 
          onClose={() => setShowInventoryBatchModal(false)} 
          onSave={handleBatchAdded}
        />
      </Modal>
    </div>
  );
};

export default MiscellaneousPurchaseModal;
