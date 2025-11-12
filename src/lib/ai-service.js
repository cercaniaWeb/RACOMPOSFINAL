// src/lib/ai-service.js
// Service for handling AI interactions with function calling

import OpenAI from 'openai';

let openai;

// Check if we have the API key before initializing OpenAI
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('OPENAI_API_KEY not found. AI functionality will not work.');
  // Create a mock client for development/testing purposes
  openai = null;
}

// Define the functions that the AI can call to interact with our data
const functions = [
  {
    name: 'getSalesForCategory',
    description: 'Get sales data for a specific category within a date range',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'The product category (e.g., "lacteos", "abarrotes", "bebidas")' },
        dateRange: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' }
          },
          required: ['startDate', 'endDate']
        }
      },
      required: ['category', 'dateRange']
    }
  },
  {
    name: 'getInventoryReport',
    description: 'Get inventory levels for a specific category',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'The product category (e.g., "lacteos", "abarrotes", "bebidas")' },
        location: { type: 'string', description: 'The store location (optional)' }
      },
      required: ['category']
    }
  },
  {
    name: 'getSalesComparison',
    description: 'Compare sales between two periods',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'The product category (optional)' },
        currentPeriod: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'Start date of current period in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date of current period in YYYY-MM-DD format' }
          },
          required: ['startDate', 'endDate']
        },
        previousPeriod: {
          type: 'object',
          properties: {
            startDate: { type: 'string', description: 'Start date of previous period in YYYY-MM-DD format' },
            endDate: { type: 'string', description: 'End date of previous period in YYYY-MM-DD format' }
          },
          required: ['startDate', 'endDate']
        }
      }
    }
  }
];

/**
 * Parse natural language query using OpenAI function calling
 * @param {string} query - The natural language query from the user
 * @returns {object} - The parsed intent and parameters
 */
export async function parseNaturalLanguageQuery(query) {
  if (!openai) {
    // Fallback: use simple pattern matching if OpenAI API is not configured
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('venta') || lowerQuery.includes('ventas')) {
      // Extract category if mentioned
      const categoryMatch = lowerQuery.match(/(lacteos|abarrotes|bebidas|vicio)/);
      const category = categoryMatch ? categoryMatch[1] : null;

      // Return a sales comparison intent as an example
      return {
        type: 'getSalesComparison',
        category: category || 'lacteos',
        currentPeriod: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        previousPeriod: {
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      };
    }

    // Default return
    return {
      type: 'getSalesComparison',
      category: 'lacteos',
      currentPeriod: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      previousPeriod: {
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4' if you prefer
      messages: [
        {
          role: 'system', 
          content: `Eres un asistente de inteligencia artificial para un sistema de punto de venta (POS) de un abarrotes. 
          Tu función es interpretar las consultas del usuario y determinar qué tipo de reporte quiere generar.
          Las consultas pueden ser sobre ventas, inventario, comparaciones de ventas entre periodos, etc.
          Debes identificar la intención y extraer los parámetros relevantes como categorías, fechas, ubicaciones, etc.`
        },
        { 
          role: 'user', 
          content: query 
        }
      ],
      functions: functions,
      function_call: 'auto'
    });

    const message = response.choices[0].message;

    if (message.function_call) {
      // Parse the function call
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // Return in our standard format
      return {
        type: functionName,
        ...functionArgs
      };
    } else {
      // If no function call was made, we need to determine the intent ourselves
      // This might happen if the AI doesn't recognize a specific function to call
      
      // Default to a sales comparison if we can't determine intent
      return {
        type: 'getSalesComparison',
        category: 'lacteos',
        currentPeriod: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        previousPeriod: {
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Fallback: use simple pattern matching if AI API fails
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('venta') || lowerQuery.includes('ventas')) {
      // Extract category if mentioned
      const categoryMatch = lowerQuery.match(/(lacteos|abarrotes|bebidas|vicio)/);
      const category = categoryMatch ? categoryMatch[1] : null;
      
      // Return a sales comparison intent as an example
      return {
        type: 'getSalesComparison',
        category: category || 'lacteos',
        currentPeriod: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        previousPeriod: {
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      };
    }
    
    // Default return
    return {
      type: 'getSalesComparison',
      category: 'lacteos',
      currentPeriod: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      previousPeriod: {
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };
  }
}