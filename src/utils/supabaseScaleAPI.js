// supabaseScaleAPI.js - API functions for scale configuration and management
import { supabase } from '../config/supabase';

/**
 * Get scale configuration for a store
 */
export const getScaleConfig = async (storeId) => {
  try {
    const { data, error } = await supabase
      .from('scale_config')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No config exists yet, return default
        return {
          store_id: storeId,
          connection_type: 'simulate',
          settings: {
            baud_rate: 9600,
            timeout: 5000,
            auto_connect: true
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching scale config:', error);
    throw error;
  }
};

/**
 * Update scale configuration for a store
 */
export const updateScaleConfig = async (storeId, config) => {
  try {
    const { data, error } = await supabase
      .from('scale_config')
      .upsert({
        store_id: storeId,
        ...config,
        updated_at: new Date().toISOString()
      }, { onConflict: 'store_id' });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating scale config:', error);
    throw error;
  }
};

/**
 * Save scale log entry
 */
export const logScaleEvent = async (storeId, eventType, details) => {
  try {
    const { error } = await supabase
      .from('scale_logs')
      .insert({
        store_id: storeId,
        event_type: eventType,
        details,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging scale event:', error);
    throw error;
  }
};

// Initialize scale configuration table if it doesn't exist
export const initializeScaleTables = async () => {
  // This function would be called during app initialization
  // In a real implementation, this would be handled by database migrations
  console.log('Initializing scale configuration tables...');
};