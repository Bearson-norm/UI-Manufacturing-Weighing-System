const SerialPort = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const net = require('net');
const EventEmitter = require('events');

class ScaleService extends EventEmitter {
  constructor() {
    super();
    this.connection = null;
    this.isConnected = false;
    this.currentWeight = 0;
    this.isStable = false;
    this.scaleConfig = {
      type: 'simulation', // 'serial', 'tcp', 'simulation'
      port: null,
      baudRate: 9600,
      host: '192.168.1.100',
      port: 4001,
      timeout: 5000,
      retryAttempts: 3
    };
    
    // Auto-start simulation mode
    this.startSimulation();
  }

  // Initialize scale connection based on configuration
  async connect(config = {}) {
    this.scaleConfig = { ...this.scaleConfig, ...config };
    
    try {
      switch (this.scaleConfig.type) {
        case 'serial':
          await this.connectSerial();
          break;
        case 'tcp':
          await this.connectTCP();
          break;
        case 'simulation':
          this.startSimulation();
          break;
        default:
          throw new Error('Invalid scale type. Use: serial, tcp, or simulation');
      }
      
      this.isConnected = true;
      this.emit('connected');
      console.log(`✅ AND Scale connected via ${this.scaleConfig.type}`);
      return true;
    } catch (error) {
      console.error('❌ Scale connection failed:', error.message);
      this.emit('error', error);
      return false;
    }
  }

  // Serial connection for AND scales (RS232/RS485)
  async connectSerial() {
    return new Promise((resolve, reject) => {
      try {
        this.connection = new SerialPort({
          path: this.scaleConfig.port,
          baudRate: this.scaleConfig.baudRate,
          dataBits: 8,
          stopBits: 1,
          parity: 'none'
        });

        const parser = this.connection.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        this.connection.on('open', () => {
          console.log('Serial port opened');
          resolve();
        });

        this.connection.on('error', (err) => {
          console.error('Serial port error:', err);
          reject(err);
        });

        parser.on('data', (data) => {
          this.processScaleData(data);
        });

        // Send initialization command for AND scales
        this.sendCommand('T'); // Tare command
        this.sendCommand('S'); // Request stable weight

      } catch (error) {
        reject(error);
      }
    });
  }

  // TCP connection for network-enabled AND scales
  async connectTCP() {
    return new Promise((resolve, reject) => {
      this.connection = new net.Socket();
      
      this.connection.connect(this.scaleConfig.port, this.scaleConfig.host, () => {
        console.log('TCP connection established');
        resolve();
      });

      this.connection.on('error', (err) => {
        console.error('TCP connection error:', err);
        reject(err);
      });

      this.connection.on('data', (data) => {
        this.processScaleData(data.toString());
      });

      this.connection.on('close', () => {
        console.log('TCP connection closed');
        this.isConnected = false;
        this.emit('disconnected');
      });

      // Send initialization commands
      setTimeout(() => {
        this.sendCommand('T'); // Tare
        this.sendCommand('S'); // Request stable weight
      }, 1000);
    });
  }

  // Simulation mode for testing
  startSimulation() {
    console.log('Starting scale simulation mode');
    this.isConnected = true;
    
    // Simulate weight readings
    setInterval(() => {
      if (this.isConnected) {
        const randomWeight = (Math.random() * 5 + 0.1).toFixed(3);
        this.currentWeight = parseFloat(randomWeight);
        this.isStable = Math.random() > 0.3; // 70% chance of being stable
        
        this.emit('weightUpdate', {
          weight: this.currentWeight,
          stable: this.isStable,
          unit: 'kg'
        });
      }
    }, 100);
  }

  // Process data received from scale
  processScaleData(data) {
    try {
      // AND scales typically send data in format: +0000.000 kg
      const cleanData = data.trim();
      
      // Parse weight value (handle various AND scale formats)
      const weightMatch = cleanData.match(/([+-]?\d+\.?\d*)/);
      if (weightMatch) {
        const weight = parseFloat(weightMatch[1]);
        this.currentWeight = weight;
        
        // Determine stability based on data format
        this.isStable = cleanData.includes('ST') || cleanData.includes('STABLE') || 
                       cleanData.includes('S') || !cleanData.includes('US');
        
        this.emit('weightUpdate', {
          weight: this.currentWeight,
          stable: this.isStable,
          unit: this.extractUnit(cleanData),
          raw: cleanData
        });
      }
    } catch (error) {
      console.error('Error processing scale data:', error);
    }
  }

  // Extract unit from scale data
  extractUnit(data) {
    if (data.toLowerCase().includes('kg')) return 'kg';
    if (data.toLowerCase().includes('g')) return 'g';
    if (data.toLowerCase().includes('lb')) return 'lb';
    if (data.toLowerCase().includes('oz')) return 'oz';
    return 'kg'; // default
  }

  // Send command to scale
  sendCommand(command) {
    if (!this.isConnected || !this.connection) {
      console.warn('Scale not connected');
      return false;
    }

    try {
      const cmd = command + '\r\n';
      
      if (this.scaleConfig.type === 'serial') {
        this.connection.write(cmd);
      } else if (this.scaleConfig.type === 'tcp') {
        this.connection.write(cmd);
      }
      
      console.log(`Sent command: ${command}`);
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  }

  // Common AND scale commands
  tare() {
    return this.sendCommand('T');
  }

  zero() {
    return this.sendCommand('Z');
  }

  requestWeight() {
    return this.sendCommand('S');
  }

  requestTare() {
    return this.sendCommand('T');
  }

  // Get current weight
  getCurrentWeight() {
    return {
      weight: this.currentWeight,
      stable: this.isStable,
      connected: this.isConnected
    };
  }

  // Disconnect from scale
  disconnect() {
    if (this.connection) {
      if (this.scaleConfig.type === 'serial') {
        this.connection.close();
      } else if (this.scaleConfig.type === 'tcp') {
        this.connection.destroy();
      }
      this.connection = null;
    }
    
    this.isConnected = false;
    this.emit('disconnected');
    console.log('Scale disconnected');
  }

  // Test connection
  async testConnection() {
    if (!this.isConnected) {
      return { success: false, message: 'Scale not connected' };
    }

    try {
      this.requestWeight();
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ success: false, message: 'No response from scale' });
        }, this.scaleConfig.timeout);

        this.once('weightUpdate', () => {
          clearTimeout(timeout);
          resolve({ success: true, message: 'Scale responding correctly' });
        });
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Singleton instance
const scaleService = new ScaleService();

module.exports = scaleService;
