# Digital Scale Integration for RECOOM POS

## Overview

This document describes the implementation of digital scale integration in the RECOOM POS system. The feature allows connecting digital weighing scales directly to the POS system to accurately measure, calculate, and process the sale of products sold by weight.

## Architecture

### Components

1. **ScaleService** (`src/services/ScaleService.js`): Core service handling all scale communication
2. **WeightModal** (`src/components/WeightModal.jsx`): Enhanced modal for weight-based product sales
3. **Scale Status Indicator**: Added to POS interface to show connection status
4. **API Utilities** (`src/utils/supabaseScaleAPI.js`): Backend integration functions (future implementation)

### Supported Connection Types

- **Serial/USB**: Direct connection using Web Serial API
- **Bluetooth**: Wireless connection using Web Bluetooth API
- **TCP/IP**: Network-enabled scales (via WebSocket)
- **Simulated Mode**: For development and testing

## Implementation Details

### ScaleService Features

- Connection management (connect, disconnect)
- Real-time weight reading
- Error handling and recovery
- Multiple scale protocol support
- Auto-reconnect capability

### WeightModal Enhancements

- Real-time scale reading display
- Auto-update weight functionality
- Manual override capability
- Connection status indicators
- Current reading button

### Status Indicators

- Header indicator showing overall scale status
- Detailed status banner in product grid area
- Visual feedback (colors: green=connected, yellow=disconnected, red=error)
- Connect/Disconnect buttons

## Usage

### For Cashiers

1. Select a weight-based product (items with kg, gr, lb, oz units)
2. The WeightModal will open with scale controls
3. Click "Conectar" to connect to the scale
4. Either:
   - Use "Actualizar automático ON" to auto-fill weight as it changes on the scale
   - Use "Usar lectura" to manually apply the current scale reading
   - Or manually enter weight in the input field
5. The price will update automatically based on the weight
6. Add to cart as usual

### For Developers

1. Import `scaleService` from `src/services/ScaleService.js`
2. Use `scaleService.connect(type, options)` to establish connection
3. Listen to weight changes with `scaleService.addWeightListener(callback)`
4. Listen to status changes with `scaleService.addStatusListener(callback)`
5. Get current weight with `scaleService.getCurrentWeight()`

## Database Changes

Added two new tables to support scale configuration:

1. **scale_config**: Store-specific scale configuration
   - store_id: Reference to store
   - connection_type: Type of connection ('serial', 'bluetooth', 'tcp', 'simulate')
   - settings: JSON configuration specific to connection type
   - is_active: Whether the configuration is currently active

2. **scale_logs**: Log of scale events for monitoring and debugging
   - store_id: Reference to store
   - event_type: Type of event ('connection', 'disconnection', 'error', 'weight_reading')
   - details: Additional event-specific information
   - timestamp: When the event occurred

## Security Considerations

- Scale connections are managed client-side and don't require server authentication
- Scale data is processed locally before integrating with POS transactions
- Connection permissions follow browser security models (user must grant access)

## Troubleshooting

### Web APIs not available
- Check if the browser supports Web Serial/Bluetooth APIs
- Ensure the application is served over HTTPS (required for most APIs)

### Scale not connecting
- Verify the scale supports the selected connection method
- Check physical connections and power
- Ensure correct configuration options are provided

### Inaccurate readings
- Verify the scale is properly calibrated
- Check for electromagnetic interference
- Consider implementing reading stabilization logic

## Future Enhancements

- Direct integration with specific scale models
- Reading stabilization algorithms
- Enhanced error recovery
- Scale diagnostic tools
- Multi-scale support
- Integration with inventory management for weight-based products