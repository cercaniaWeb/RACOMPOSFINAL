// Funciones de validación de formularios
export const validateExpenseForm = (expenseData) => {
  const errors = {};

  // Validar concepto
  if (!expenseData.concept || expenseData.concept.trim().length === 0) {
    errors.concept = 'El concepto es obligatorio';
  } else if (expenseData.concept.trim().length < 3) {
    errors.concept = 'El concepto debe tener al menos 3 caracteres';
  }

  // Validar monto
  if (expenseData.amount === undefined || expenseData.amount === null || expenseData.amount === '') {
    errors.amount = 'El monto es obligatorio';
  } else if (isNaN(parseFloat(expenseData.amount)) || parseFloat(expenseData.amount) <= 0) {
    errors.amount = 'El monto debe ser un número positivo';
  } else if (parseFloat(expenseData.amount) > 9999999.99) {
    errors.amount = 'El monto es demasiado alto';
  }

  // Validar tipo
  if (!expenseData.type || expenseData.type.trim().length === 0) {
    errors.type = 'El tipo es obligatorio';
  }

  // Validar fecha
  if (!expenseData.date) {
    errors.date = 'La fecha es obligatoria';
  } else {
    const date = new Date(expenseData.date);
    if (isNaN(date.getTime()) || date > new Date()) {
      errors.date = 'La fecha debe ser válida y no puede ser futura';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validación para elementos de la lista de compras
export const validateShoppingItem = (item) => {
  const errors = {};

  if (!item.name || item.name.trim().length === 0) {
    errors.name = 'El nombre del artículo es obligatorio';
  } else if (item.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  if (item.cost === undefined || item.cost === null || item.cost === '') {
    errors.cost = 'El costo es obligatorio';
  } else if (isNaN(parseFloat(item.cost)) || parseFloat(item.cost) < 0) {
    errors.cost = 'El costo debe ser un número positivo';
  } else if (parseFloat(item.cost) > 9999999.99) {
    errors.cost = 'El costo es demasiado alto';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validación genérica
export const validateField = (fieldName, value, rules = {}) => {
  const errors = [];

  // Validación de campo requerido
  if (rules.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
    errors.push('Este campo es obligatorio');
  }

  // Validación de longitud mínima
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    errors.push(`Debe tener al menos ${rules.minLength} caracteres`);
  }

  // Validación de longitud máxima
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    errors.push(`No debe exceder ${rules.maxLength} caracteres`);
  }

  // Validación de tipo numérico
  if (rules.numeric && value !== '' && isNaN(parseFloat(value))) {
    errors.push('Debe ser un número válido');
  }

  // Validación de rango
  if (rules.min !== undefined && parseFloat(value) < rules.min) {
    errors.push(`Debe ser mayor o igual a ${rules.min}`);
  }

  if (rules.max !== undefined && parseFloat(value) > rules.max) {
    errors.push(`Debe ser menor o igual a ${rules.max}`);
  }

  // Validación con expresión regular
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.patternMessage || 'Formato inválido');
  }

  return errors;
};