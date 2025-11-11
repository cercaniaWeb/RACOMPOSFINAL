// server.js - AI API Server for POS Intelligent Chat
const express = require('express');
const cors = require('cors');
const { parseNaturalLanguageQuery } = require('./src/lib/ai-service');
const { getSalesForCategory, getInventoryReport, getSalesComparison } = require('./src/lib/query-functions');
const { formatResponse } = require('./src/lib/response-formatter');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint for processing natural language queries
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Parse the natural language query to identify intent
    const queryIntent = await parseNaturalLanguageQuery(message);

    let result;

    // Route to appropriate function based on intent
    switch (queryIntent.type) {
      case 'getSalesForCategory':
        result = await getSalesForCategory(queryIntent.category, queryIntent.dateRange);
        break;
      case 'getInventoryReport':
        result = await getInventoryReport(queryIntent.category, queryIntent.location);
        break;
      case 'getSalesComparison':
        result = await getSalesComparison(
          queryIntent.category, 
          queryIntent.currentPeriod, 
          queryIntent.previousPeriod
        );
        break;
      default:
        return res.status(400).json({ 
          error: 'No se pudo interpretar la consulta' 
        });
    }

    // Format the result into a natural language response
    const formattedResponse = formatResponse(result, queryIntent);

    res.json({ 
      message: formattedResponse,
      data: result,
      queryIntent
    });
  } catch (error) {
    console.error('Error processing chat query:', error);
    res.status(500).json({ 
      error: 'Error procesando la consulta' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI API Server running on port ${PORT}`);
});