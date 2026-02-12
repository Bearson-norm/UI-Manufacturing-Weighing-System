const express = require('express');
const router = express.Router();
const scaleService = require('../services/scaleService');

// Get scale status
router.get('/status', (req, res) => {
  try {
    const status = scaleService.getCurrentWeight();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get scale status',
      error: error.message
    });
  }
});

// Connect to scale
router.post('/connect', async (req, res) => {
  try {
    const { type, port, baudRate, host, tcpPort } = req.body;
    
    const config = {
      type: type || 'simulation',
      port: type === 'serial' ? port : tcpPort,
      baudRate: baudRate || 9600,
      host: host || '192.168.1.100'
    };

    const connected = await scaleService.connect(config);
    
    if (connected) {
      res.json({
        success: true,
        message: 'Scale connected successfully',
        data: { type: config.type, connected: true }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to connect to scale'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to connect to scale',
      error: error.message
    });
  }
});

// Disconnect from scale
router.post('/disconnect', (req, res) => {
  try {
    scaleService.disconnect();
    res.json({
      success: true,
      message: 'Scale disconnected successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect from scale',
      error: error.message
    });
  }
});

// Send command to scale
router.post('/command', (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        message: 'Command is required'
      });
    }

    const sent = scaleService.sendCommand(command);
    
    if (sent) {
      res.json({
        success: true,
        message: `Command '${command}' sent successfully`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send command'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send command',
      error: error.message
    });
  }
});

// Tare scale
router.post('/tare', (req, res) => {
  try {
    const success = scaleService.tare();
    
    if (success) {
      res.json({
        success: true,
        message: 'Tare command sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send tare command'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send tare command',
      error: error.message
    });
  }
});

// Zero scale
router.post('/zero', (req, res) => {
  try {
    const success = scaleService.zero();
    
    if (success) {
      res.json({
        success: true,
        message: 'Zero command sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send zero command'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send zero command',
      error: error.message
    });
  }
});

// Request weight reading
router.post('/weight', (req, res) => {
  try {
    const success = scaleService.requestWeight();
    
    if (success) {
      res.json({
        success: true,
        message: 'Weight request sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to request weight'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to request weight',
      error: error.message
    });
  }
});

// Test scale connection
router.get('/test', async (req, res) => {
  try {
    const result = await scaleService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test scale connection',
      error: error.message
    });
  }
});

// Get available serial ports (for configuration)
router.get('/ports', async (req, res) => {
  try {
    const SerialPort = require('serialport');
    const ports = await SerialPort.list();
    
    res.json({
      success: true,
      data: ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        locationId: port.locationId,
        vendorId: port.vendorId,
        productId: port.productId
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get serial ports',
      error: error.message
    });
  }
});

module.exports = router;


