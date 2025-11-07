// ScaleService.js - Handles communication with digital scales
class ScaleService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.weightListeners = [];
    this.statusListeners = [];
    this.currentWeight = 0;
    this.currentUnit = 'kg';
    this.connectionType = null;
    this.simulatedMode = false;
    this.simulationInterval = null;
  }

  /**
   * Initialize connection to digital scale
   * @param {string} type - Type of connection: 'serial', 'bluetooth', 'tcp', 'simulate'
   * @param {object} options - Connection options specific to the type
   */
  async connect(type, options = {}) {
    try {
      this.connectionType = type;
      
      switch (type) {
        case 'serial':
          return await this.connectSerial(options);
        case 'bluetooth':
          return await this.connectBluetooth(options);
        case 'tcp':
          return await this.connectTCP(options);
        case 'simulate':
          return this.startSimulation(options);
        default:
          throw new Error(`Tipo de conexión no soportado: ${type}`);
      }
    } catch (error) {
      console.error('Error de conexión con la balanza:', error);
      throw error;
    }
  }

  /**
   * Connect via Web Serial API
   */
  async connectSerial(options = {}) {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API not supported');
    }

    try {
      this.connection = await navigator.serial.requestPort(options);
      await this.connection.open({ baudRate: options.baudRate || 9600 });
      
      this.isConnected = true;
      this.updateStatus('connected', 'Balanza serial conectada');
      
      // Start reading data continuously
      this.readSerialData();
      
      return { success: true, message: 'Conexión a balanza serial exitosa' };
    } catch (error) {
      this.isConnected = false;
      this.updateStatus('error', `Conexión serial fallida: ${error.message}`);
      throw error;
    }
  }

  /**
   * Connect via Web Bluetooth API
   */
  async connectBluetooth(options = {}) {
    if (!('bluetooth' in navigator)) {
      throw new Error('Web Bluetooth API not supported');
    }

    try {
      // Filter for scale-like devices
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: options.name || 'scale' },
          { namePrefix: options.namePrefix || 'SCA' },
          { services: [options.serviceUUID || 'serial_port'] }
        ]
      });

      const server = await device.gatt.connect();
      this.connection = { device, server };
      
      this.isConnected = true;
      this.updateStatus('connected', 'Balanza Bluetooth conectada');
      
      // Start reading data
      this.readBluetoothData();
      
      return { success: true, message: 'Conexión a balanza Bluetooth exitosa' };
    } catch (error) {
      this.isConnected = false;
      this.updateStatus('error', `Conexión Bluetooth fallida: ${error.message}`);
      throw error;
    }
  }

  /**
   * Connect via TCP/IP (for network-enabled scales)
   */
  async connectTCP(options = {}) {
    // This would require a WebSocket or similar implementation
    // For now, we'll simulate this with a WebSocket connection to a backend service
    try {
      const { host = 'localhost', port = 8080 } = options;
      const wsUrl = `ws://${host}:${port}`;
      
      this.connection = new WebSocket(wsUrl);
      
      this.connection.onopen = () => {
        this.isConnected = true;
        this.updateStatus('connected', 'Balanza TCP conectada');
      };
      
      this.connection.onmessage = (event) => {
        const weightData = this.parseWeightData(event.data);
        if (weightData) {
          this.setCurrentWeight(weightData.weight, weightData.unit);
        }
      };
      
      this.connection.onerror = (error) => {
        this.isConnected = false;
        this.updateStatus('error', `Error de conexión TCP: ${error.message}`);
      };
      
      this.connection.onclose = () => {
        this.isConnected = false;
        this.updateStatus('disconnected', 'Balanza TCP desconectada');
      };

      return { success: true, message: 'TCP scale connection initiated' };
    } catch (error) {
      this.isConnected = false;
      this.updateStatus('error', `Conexión TCP fallida: ${error.message}`);
      throw error;
    }
  }

  /**
   * Start simulation mode for development
   */
  startSimulation(options = {}) {
    this.simulatedMode = true;
    this.isConnected = true;
    this.updateStatus('connected', 'Modo simulación de balanza activo');
    
    // Create simulated weight readings
    this.simulationInterval = setInterval(() => {
      // Generate a realistic weight between 0 and 5 kg
      const simulatedWeight = Math.random() * 5;
      this.setCurrentWeight(parseFloat(simulatedWeight.toFixed(3)), 'kg');
    }, options.interval || 1000);
    
    return { success: true, message: 'Simulación de balanza iniciada' };
  }

  /**
   * Read data from serial connection
   */
  async readSerialData() {
    if (!this.connection) return;
    
    const reader = this.connection.readable.getReader();
    
    try {
      while (this.isConnected) {
        const { value, done } = await reader.read();
        if (done) {
          this.isConnected = false;
          this.updateStatus('disconnected', 'Serial connection closed');
          break;
        }
        
        // Convert bytes to text
        const text = new TextDecoder().decode(value);
        
        // Parse weight data from the scale
        const weightData = this.parseWeightData(text);
        if (weightData) {
          this.setCurrentWeight(weightData.weight, weightData.unit);
        }
      }
    } catch (error) {
      console.error('Error de lectura serial:', error);
      this.updateStatus('error', `Error de lectura serial: ${error.message}`);
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Read data from Bluetooth connection
   */
  async readBluetoothData() {
    if (!this.connection) return;
    
    try {
      // Get the primary service
      const primaryService = await this.connection.server.getPrimaryService('serial_port');
      
      // Get the characteristic for weight readings
      const characteristic = await primaryService.getCharacteristic('weight');
      
      // Start notifications
      await characteristic.startNotifications();
      
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const text = new TextDecoder().decode(value);
        const weightData = this.parseWeightData(text);
        
        if (weightData) {
          this.setCurrentWeight(weightData.weight, weightData.unit);
        }
      });
    } catch (error) {
      console.error('Error de lectura Bluetooth:', error);
      this.updateStatus('error', `Error de lectura Bluetooth: ${error.message}`);
    }
  }

  /**
   * Parse raw data from scale to extract weight and unit
   */
  parseWeightData(rawData) {
    // This is a generic parser - different scales may have different formats
    // Common format: "001230 g" or "1.230 kg" or "00012.3 lb"
    
    // Example of common scale data formats:
    // Raw data might look like: "S|+|1.230|kg|g|Net|Stable"
    // Or: "1.230 kg"
    
    if (typeof rawData !== 'string') {
      rawData = String.fromCharCode.apply(null, new Uint8Array(rawData));
    }
    
    // Try to extract weight and unit from various formats
    const patterns = [
      /([+-]?\d+\.?\d*)\s*([a-z]+)/i, // matches "1.230 kg"
      /.*\|([+-]?\d+\.?\d*)\s*([a-z]+)\|/, // matches "S|+|1.230 kg|g|Net|Stable"
    ];
    
    for (const pattern of patterns) {
      const match = rawData.match(pattern);
      if (match) {
        const weight = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        return { weight, unit };
      }
    }
    
    // If no pattern matches, return null
    return null;
  }

  /**
   * Set current weight and notify listeners
   */
  setCurrentWeight(weight, unit = 'kg') {
    this.currentWeight = weight;
    this.currentUnit = unit;
    this.notifyWeightListeners(weight, unit);
  }

  /**
   * Add listener for weight changes
   */
  addWeightListener(callback) {
    this.weightListeners.push(callback);
  }

  /**
   * Remove weight listener
   */
  removeWeightListener(callback) {
    const index = this.weightListeners.indexOf(callback);
    if (index !== -1) {
      this.weightListeners.splice(index, 1);
    }
  }

  /**
   * Add listener for status changes
   */
  addStatusListener(callback) {
    this.statusListeners.push(callback);
  }

  /**
   * Remove status listener
   */
  removeStatusListener(callback) {
    const index = this.statusListeners.indexOf(callback);
    if (index !== -1) {
      this.statusListeners.splice(index, 1);
    }
  }

  /**
   * Notify all weight listeners
   */
  notifyWeightListeners(weight, unit) {
    this.weightListeners.forEach(listener => {
      try {
        listener(weight, unit);
      } catch (error) {
        console.error('Error in weight listener:', error);
      }
    });
  }

  /**
   * Notify all status listeners
   */
  notifyStatusListeners(status, message) {
    this.statusListeners.forEach(listener => {
      try {
        listener(status, message);
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  /**
   * Update status and notify listeners
   */
  updateStatus(status, message) {
    this.notifyStatusListeners(status, message);
  }

  /**
   * Get current weight reading
   */
  getCurrentWeight() {
    return { weight: this.currentWeight, unit: this.currentUnit, isConnected: this.isConnected };
  }

  /**
   * Disconnect from scale
   */
  async disconnect() {
    try {
      if (this.simulationInterval) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
      }
      
      if (this.connectionType === 'serial' && this.connection) {
        await this.connection.close();
      } else if (this.connectionType === 'bluetooth' && this.connection) {
        await this.connection.server.disconnect();
      } else if (this.connectionType === 'tcp' && this.connection) {
        this.connection.close();
      }
      
      this.connection = null;
      this.isConnected = false;
      this.connectionType = null;
      this.simulatedMode = false;
      
      this.updateStatus('disconnected', 'Balanza desconectada');
      
      return { success: true, message: 'Balanza desconectada exitosamente' };
    } catch (error) {
      console.error('Error al desconectar la balanza:', error);
      return { success: false, message: error.message };
    }
  }
}

// Export a singleton instance
const scaleService = new ScaleService();
export default scaleService;