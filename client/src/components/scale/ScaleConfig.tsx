import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Settings, Wifi, Usb, Monitor, CheckCircle, XCircle } from 'lucide-react';
import { scaleApi, ScaleConfig, SerialPort } from '../../services/scaleApi';
import { useScale } from '../../hooks/useScale';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

interface ScaleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScaleConfigModal: React.FC<ScaleConfigModalProps> = ({ isOpen, onClose }) => {
  const { connect, disconnect, isConnected, testConnection } = useScale();
  const [config, setConfig] = useState<ScaleConfig>({
    type: 'simulation',
    port: '',
    baudRate: 9600,
    host: '192.168.1.100',
    tcpPort: 4001,
  });

  // Get available serial ports
  const { data: serialPorts = [], isLoading: portsLoading } = useQuery(
    'serial-ports',
    scaleApi.getSerialPorts,
    {
      enabled: isOpen,
    }
  );

  const connectionTypes = [
    { value: 'simulation', label: 'Simulation Mode', icon: Monitor },
    { value: 'serial', label: 'Serial/USB (RS232/RS485)', icon: Usb },
    { value: 'tcp', label: 'TCP/IP Network', icon: Wifi },
  ];

  const baudRates = [
    { value: '9600', label: '9600 bps' },
    { value: '19200', label: '19200 bps' },
    { value: '38400', label: '38400 bps' },
    { value: '57600', label: '57600 bps' },
    { value: '115200', label: '115200 bps' },
  ];

  const handleConnect = () => {
    if (config.type === 'serial' && !config.port) {
      toast.error('Please select a serial port');
      return;
    }
    if (config.type === 'tcp' && !config.host) {
      toast.error('Please enter a host address');
      return;
    }

    connect(config);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleTest = () => {
    testConnection();
  };

  const serialPortOptions = serialPorts.map((port: SerialPort) => ({
    value: port.path,
    label: `${port.path}${port.manufacturer ? ` (${port.manufacturer})` : ''}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scale Configuration"
      size="lg"
    >
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Connection Status</span>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-success-600" />
                <Badge variant="success">Connected</Badge>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-danger-600" />
                <Badge variant="danger">Disconnected</Badge>
              </>
            )}
          </div>
        </div>

        {/* Connection Type */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Connection Type
          </label>
          <div className="grid grid-cols-1 gap-3">
            {connectionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setConfig({ ...config, type: type.value as any })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    config.type === type.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{type.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Serial Configuration */}
        {config.type === 'serial' && (
          <div className="space-y-4">
            <Select
              label="Serial Port"
              value={config.port || ''}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
              options={serialPortOptions}
              placeholder="Select a serial port"
              disabled={portsLoading}
            />

            <Select
              label="Baud Rate"
              value={config.baudRate?.toString() || '9600'}
              onChange={(e) => setConfig({ ...config, baudRate: parseInt(e.target.value) })}
              options={baudRates}
            />
          </div>
        )}

        {/* TCP Configuration */}
        {config.type === 'tcp' && (
          <div className="space-y-4">
            <Input
              label="Host Address"
              value={config.host || ''}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="192.168.1.100"
            />

            <Input
              label="Port"
              type="number"
              value={config.tcpPort || 4001}
              onChange={(e) => setConfig({ ...config, tcpPort: parseInt(e.target.value) })}
              placeholder="4001"
            />
          </div>
        )}

        {/* Simulation Info */}
        {config.type === 'simulation' && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Simulation Mode</span>
            </div>
            <p className="text-sm text-blue-700">
              In simulation mode, the scale will generate random weight readings for testing purposes.
              No physical scale connection is required.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {isConnected ? (
            <>
              <Button
                onClick={handleTest}
                variant="outline"
                className="flex-1"
              >
                Test Connection
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="danger"
                className="flex-1"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              className="flex-1"
            >
              Connect to Scale
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScaleConfigModal;


