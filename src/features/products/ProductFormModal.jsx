import React from 'react';
import ProductForm from './ProductForm';

const ProductFormModal = ({ product, onClose, onSuccess }) => {
  return (
    <ProductForm 
      product={product} 
      onClose={onClose} 
      onSuccess={onSuccess} 
      mode="modal" 
    />
  );
};

export default ProductFormModal;