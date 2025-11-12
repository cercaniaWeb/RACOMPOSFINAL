// Load environment variables FIRST before other imports
import 'dotenv/config';

// server.mjs - AI API Server for POS Intelligent Chat
import express from 'express';
import cors from 'cors';
import { parseNaturalLanguageQuery } from './src/lib/ai-service.js';
import { getSalesForCategory, getInventoryReport, getSalesComparison } from './src/lib/query-functions.js';
import { formatResponse } from './src/lib/response-formatter.js';

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