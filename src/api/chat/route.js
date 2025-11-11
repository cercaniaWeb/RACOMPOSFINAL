import { NextResponse } from 'next/server';
import { parseNaturalLanguageQuery } from '../../lib/ai-service';
import { getSalesForCategory, getInventoryReport, getSalesComparison } from '../../lib/query-functions';
import { formatResponse } from '../../lib/response-formatter';

// Main API endpoint for processing natural language queries
export async function POST(request) {
  try {
    const { message } = await request.json();

    // Parse the natural language query to identify intent
    const queryIntent = await parseNaturalLanguageQuery(message);

    let result;

    // Route to appropriate function based on intent
    switch (queryIntent.type) {
      case 'sales-report':
        result = await getSalesForCategory(queryIntent.category, queryIntent.dateRange);
        break;
      case 'inventory-report':
        result = await getInventoryReport(queryIntent.category, queryIntent.location);
        break;
      case 'sales-comparison':
        // Format dateRange into currentPeriod and previousPeriod for the comparison function
        result = await getSalesComparison(
          queryIntent.category, 
          queryIntent.dateRange, 
          {
            startDate: new Date(new Date(queryIntent.dateRange.startDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date(new Date(queryIntent.dateRange.endDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        );
        break;
      default:
        return NextResponse.json({ 
          error: 'No se pudo interpretar la consulta' 
        }, { status: 400 });
    }

    // Format the result into a natural language response
    const formattedResponse = formatResponse(result, queryIntent);

    return NextResponse.json({ 
      message: formattedResponse,
      data: result,
      queryIntent
    });
  } catch (error) {
    console.error('Error processing chat query:', error);
    return NextResponse.json({ 
      error: 'Error procesando la consulta' 
    }, { status: 500 });
  }
}