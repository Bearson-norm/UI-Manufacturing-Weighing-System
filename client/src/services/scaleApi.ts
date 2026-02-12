import api from './api';

export interface ScaleStatus {
  weight: number;
  stable: boolean;
  connected: boolean;
}

export interface ScaleConfig {
  type: 'serial' | 'tcp' | 'simulation';
  port?: string;
  baudRate?: number;
  host?: string;
  tcpPort?: number;
}

export interface SerialPort {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

// Scale API service
export const scaleApi = {
  // Get current scale status
  getStatus: (): Promise<ScaleStatus> =>
    api.get('/scale/status').then(response => response.data.data),

  // Connect to scale
  connect: (config: ScaleConfig): Promise<{ success: boolean; message: string; data?: any }> =>
    api.post('/scale/connect', config).then(response => response.data),

  // Disconnect from scale
  disconnect: (): Promise<{ success: boolean; message: string }> =>
    api.post('/scale/disconnect').then(response => response.data),

  // Send command to scale
  sendCommand: (command: string): Promise<{ success: boolean; message: string }> =>
    api.post('/scale/command', { command }).then(response => response.data),

  // Tare scale
  tare: (): Promise<{ success: boolean; message: string }> =>
    api.post('/scale/tare').then(response => response.data),

  // Zero scale
  zero: (): Promise<{ success: boolean; message: string }> =>
    api.post('/scale/zero').then(response => response.data),

  // Request weight reading
  requestWeight: (): Promise<{ success: boolean; message: string }> =>
    api.post('/scale/weight').then(response => response.data),

  // Test scale connection
  testConnection: (): Promise<{ success: boolean; message: string }> =>
    api.get('/scale/test').then(response => response.data),

  // Get available serial ports
  getSerialPorts: (): Promise<SerialPort[]> =>
    api.get('/scale/ports').then(response => response.data.data),
};

export default scaleApi;


