# AND Scales Integration Guide

This document provides comprehensive information about integrating AND scales with the Manufacturing Dashboard system.

## 🎯 Overview

The system now supports real-time communication with AND scales through multiple connection methods:
- **Serial/USB (RS232/RS485)**: Direct connection via serial ports
- **TCP/IP Network**: Network-enabled scales via Ethernet
- **Simulation Mode**: For testing and development

## 🔌 Supported AND Scale Models

### Serial/USB Compatible Models
- AND FX-3000i series
- AND FX-2000i series
- AND FX-1000i series
- AND GX series
- AND EK series
- Most AND scales with RS232/RS485 output

### Network Compatible Models
- AND FX-3000i with network module
- AND FX-2000i with network module
- AND GX series with network capability
- Any AND scale with TCP/IP communication

## 🛠️ Connection Methods

### 1. Serial/USB Connection (RS232/RS485)

#### Hardware Requirements
- AND scale with RS232 or RS485 output
- USB-to-Serial adapter (if needed)
- Appropriate cables

#### Configuration
```javascript
{
  type: 'serial',
  port: 'COM3',        // Windows: COM1, COM2, etc.
  baudRate: 9600       // Common rates: 9600, 19200, 38400, 57600, 115200
}
```

#### Wiring (RS232)
```
Scale DB9    Computer DB9
Pin 2   ->   Pin 2 (RXD)
Pin 3   ->   Pin 3 (TXD)
Pin 5   ->   Pin 5 (GND)
```

#### Wiring (RS485)
```
Scale A+  ->  RS485 A+
Scale B-  ->  RS485 B-
Scale GND ->  RS485 GND
```

### 2. TCP/IP Network Connection

#### Hardware Requirements
- AND scale with network module
- Ethernet cable
- Network connectivity

#### Configuration
```javascript
{
  type: 'tcp',
  host: '192.168.1.100',  // Scale IP address
  tcpPort: 4001           // Scale TCP port (usually 4001)
}
```

#### Network Setup
1. Configure scale IP address (usually via scale menu)
2. Ensure network connectivity
3. Test connection with ping
4. Configure firewall if needed

### 3. Simulation Mode

For testing and development without physical hardware:
```javascript
{
  type: 'simulation'
}
```

## 📡 Communication Protocol

### AND Scale Commands

| Command | Description | Response Format |
|---------|-------------|-----------------|
| `T` | Tare (set current weight as zero) | `+0000.000 kg` |
| `Z` | Zero (reset to zero) | `+0000.000 kg` |
| `S` | Request stable weight | `+0000.000 kg ST` |
| `W` | Request weight (any status) | `+0000.000 kg` |

### Data Format Examples

#### Stable Weight Reading
```
+0001.250 kg ST
```

#### Unstable Weight Reading
```
+0001.248 kg US
```

#### Zero Weight
```
+0000.000 kg ST
```

#### Negative Weight
```
-0000.500 kg ST
```

## 🔧 Installation and Setup

### 1. Install Dependencies

```bash
# Backend dependencies
npm install serialport @serialport/parser-readline

# For Windows, you may need to rebuild native modules
npm rebuild serialport
```

### 2. Configure Scale

1. **Access Scale Menu**:
   - Press and hold the "MODE" button
   - Navigate to communication settings

2. **Serial Settings**:
   - Baud Rate: 9600 (recommended)
   - Data Bits: 8
   - Stop Bits: 1
   - Parity: None
   - Protocol: AND (if available)

3. **Network Settings** (if applicable):
   - IP Address: Set static IP
   - Port: 4001 (default)
   - Protocol: TCP

### 3. Test Connection

Use the built-in test function:
```javascript
// Via API
GET /api/scale/test

// Via frontend
Click "Test Connection" in Scale tab
```

## 🎮 Usage Guide

### 1. Scale Configuration

1. Open the Manufacturing Dashboard
2. Navigate to the "Scale" tab
3. Click "Configure Scale"
4. Select connection type:
   - **Simulation**: For testing
   - **Serial/USB**: For direct connection
   - **TCP/IP**: For network connection
5. Configure connection parameters
6. Click "Connect to Scale"

### 2. Production Workflow

1. **Start Production**:
   - Create or select a Manufacturing Order
   - Click "Start Production"

2. **Weigh Materials**:
   - Place material on scale
   - Wait for stable reading (green indicator)
   - Click "Capture Weight"

3. **Scale Controls**:
   - **Tare**: Set current weight as zero
   - **Zero**: Reset scale to zero
   - **Request Weight**: Get current reading

### 3. Monitoring

- **Connection Status**: Shows if scale is connected
- **Weight Display**: Real-time weight reading
- **Stability Indicator**: Shows if reading is stable
- **Last Captured**: Shows last captured weight

## 🔍 Troubleshooting

### Common Issues

#### 1. Scale Not Connecting (Serial)
- **Check cable connections**
- **Verify COM port** (Windows Device Manager)
- **Check baud rate** (must match scale settings)
- **Try different USB port**
- **Install drivers** for USB-to-Serial adapter

#### 2. Scale Not Connecting (TCP)
- **Check IP address** (ping the scale)
- **Verify port number** (usually 4001)
- **Check firewall settings**
- **Ensure scale is in network mode**

#### 3. Unstable Readings
- **Check scale calibration**
- **Ensure stable surface**
- **Wait for readings to stabilize**
- **Check for vibrations or air currents**

#### 4. Wrong Weight Values
- **Check scale units** (kg, g, lb, oz)
- **Verify scale calibration**
- **Check for tare/zero issues**

### Debug Mode

Enable debug logging:
```javascript
// In server/services/scaleService.js
console.log('Scale data received:', data);
console.log('Parsed weight:', weight);
console.log('Stability:', isStable);
```

## 📊 API Reference

### Scale Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scale/status` | Get current scale status |
| POST | `/api/scale/connect` | Connect to scale |
| POST | `/api/scale/disconnect` | Disconnect from scale |
| POST | `/api/scale/tare` | Send tare command |
| POST | `/api/scale/zero` | Send zero command |
| POST | `/api/scale/weight` | Request weight reading |
| GET | `/api/scale/test` | Test scale connection |
| GET | `/api/scale/ports` | Get available serial ports |

### Example API Calls

#### Connect to Serial Scale
```javascript
POST /api/scale/connect
{
  "type": "serial",
  "port": "COM3",
  "baudRate": 9600
}
```

#### Connect to Network Scale
```javascript
POST /api/scale/connect
{
  "type": "tcp",
  "host": "192.168.1.100",
  "tcpPort": 4001
}
```

#### Get Scale Status
```javascript
GET /api/scale/status

Response:
{
  "success": true,
  "data": {
    "weight": 1.250,
    "stable": true,
    "connected": true
  }
}
```

## 🔒 Security Considerations

1. **Network Security**:
   - Use VPN for remote access
   - Configure firewall rules
   - Use secure network protocols

2. **Data Validation**:
   - Validate all weight readings
   - Check for reasonable values
   - Implement error handling

3. **Access Control**:
   - Restrict scale configuration access
   - Log all scale operations
   - Monitor for unauthorized access

## 📈 Performance Optimization

1. **Connection Pooling**:
   - Reuse connections when possible
   - Implement connection timeouts
   - Handle disconnections gracefully

2. **Data Processing**:
   - Filter out invalid readings
   - Implement data smoothing
   - Cache stable readings

3. **Error Handling**:
   - Implement retry mechanisms
   - Log all errors
   - Provide user feedback

## 🧪 Testing

### Unit Tests
```bash
# Test scale service
npm test -- --grep "scale"

# Test API endpoints
npm test -- --grep "scale api"
```

### Integration Tests
```bash
# Test with real scale
npm run test:integration:scale

# Test simulation mode
npm run test:simulation
```

### Manual Testing
1. Connect scale in simulation mode
2. Test all commands (tare, zero, weight)
3. Test connection/disconnection
4. Test error handling
5. Test with real hardware

## 📝 Configuration Examples

### Production Environment
```javascript
{
  type: 'tcp',
  host: '192.168.1.100',
  tcpPort: 4001,
  timeout: 5000,
  retryAttempts: 3
}
```

### Development Environment
```javascript
{
  type: 'simulation',
  // No additional config needed
}
```

### Serial Development
```javascript
{
  type: 'serial',
  port: '/dev/ttyUSB0',  // Linux
  baudRate: 9600
}
```

## 🆘 Support

For technical support with AND scales integration:

1. **Check Documentation**: Review this guide thoroughly
2. **Test Connection**: Use built-in test functions
3. **Check Logs**: Review server logs for errors
4. **Contact Support**: Reach out to development team

## 📚 Additional Resources

- [AND Scales Manual](https://www.aandd.jp/products/weighing/)
- [Serial Communication Guide](https://en.wikipedia.org/wiki/RS-232)
- [TCP/IP Communication](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)
- [Node.js SerialPort Documentation](https://serialport.io/docs/)

---

**Note**: This integration supports most AND scale models. For specific model compatibility, refer to the scale's communication manual or contact AND technical support.


