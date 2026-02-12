import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Scale, Settings, Wifi, Usb, Monitor, CheckCircle, XCircle, RotateCcw, Zap } from 'lucide-react';
import { scaleApi, SerialPort } from '../../services/scaleApi';
import { useScale } from '../../hooks/useScale';
import Button from '../ui/Button';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import ScaleConfigModal from '../scale/ScaleConfig';
import toast from 'react-hot-toast';

const ScaleTab: React.FC = () => {
  const [showConfig, setShowConfig] = useState(false);
  const {
    isConnected,
    currentWeight,
    isStable,
    unit,
    scaleStatus,
    connect,
    disconnect,
    tare,
    zero,
    requestWeight,
    testConnection,
    isConnecting,
    isDisconnecting,
    isTaring,
    isZeroing,
    isTesting,
  } = useScale();

  // Get available serial ports
  const { data: serialPorts = [], isLoading: portsLoading } = useQuery(
    'serial-ports',
    scaleApi.getSerialPorts,
    {
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  );

  const handleQuickConnect = (type: 'simulation' | 'serial' | 'tcp') => {
    const configs = {
      simulation: { type: 'simulation' as const },
      serial: { 
        type: 'serial' as const, 
        port: serialPorts[0]?.path || '', 
        baudRate: 9600 
      },
      tcp: { 
        type: 'tcp' as const, 
        host: '192.168.1.100', 
        tcpPort: 4001 
      },
    };

    connect(configs[type]);
  };

  const scaleCommands = [
    {
      name: 'Tare',
      description: 'Set current weight as zero',
      action: tare,
      loading: isTaring,
      icon: RotateCcw,
    },
    {
      name: 'Zero',
      description: 'Reset scale to zero',
      action: zero,
      loading: isZeroing,
      icon: Zap,
    },
    {
      name: 'Request Weight',
      description: 'Request weight reading',
      action: requestWeight,
      loading: false,
      icon: Scale,
    },
    {
      name: 'Test Connection',
      description: 'Test scale communication',
      action: testConnection,
      loading: isTesting,
      icon: CheckCircle,
    },
  ];

  const serialPortColumns = [
    {
      key: 'path',
      title: 'Port',
      render: (value: string) => <span className="font-mono">{value}</span>,
    },
    {
      key: 'manufacturer',
      title: 'Manufacturer',
      render: (value: string) => value || 'Unknown',
    },
    {
      key: 'serialNumber',
      title: 'Serial Number',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'vendorId',
      title: 'Vendor ID',
      render: (value: string) => value ? `0x${value}` : 'N/A',
    },
    {
      key: 'productId',
      title: 'Product ID',
      render: (value: string) => value ? `0x${value}` : 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary-600" />
          Scale Management
        </h2>
        <Button
          onClick={() => setShowConfig(true)}
          leftIcon={<Settings className="w-5 h-5" />}
        >
          Configure Scale
        </Button>
      </div>

      {/* Scale Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connection Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {isConnected ? (
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-danger-600" />
                  )}
                  <Badge variant={isConnected ? 'success' : 'danger'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-2xl font-bold text-primary-600">
                  {isConnected ? `${currentWeight.toFixed(3)} ${unit}` : '---'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stability</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${isStable ? 'bg-success-400' : 'bg-warning-400'} animate-pulse`} />
                  <Badge variant={isStable ? 'success' : 'warning'}>
                    {isStable ? 'Stable' : 'Unstable'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Connect Buttons */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Connect</h3>
          <p className="card-description">Connect to scale using common configurations</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleQuickConnect('simulation')}
              isLoading={isConnecting}
              variant="outline"
              className="h-20 flex-col gap-2"
              leftIcon={<Monitor className="w-6 h-6" />}
            >
              <span className="font-semibold">Simulation Mode</span>
              <span className="text-xs text-gray-500">For testing</span>
            </Button>

            <Button
              onClick={() => handleQuickConnect('serial')}
              isLoading={isConnecting}
              variant="outline"
              className="h-20 flex-col gap-2"
              leftIcon={<Usb className="w-6 h-6" />}
              disabled={serialPorts.length === 0}
            >
              <span className="font-semibold">Serial/USB</span>
              <span className="text-xs text-gray-500">
                {serialPorts.length > 0 ? `${serialPorts.length} ports found` : 'No ports found'}
              </span>
            </Button>

            <Button
              onClick={() => handleQuickConnect('tcp')}
              isLoading={isConnecting}
              variant="outline"
              className="h-20 flex-col gap-2"
              leftIcon={<Wifi className="w-6 h-6" />}
            >
              <span className="font-semibold">TCP/IP Network</span>
              <span className="text-xs text-gray-500">192.168.1.100:4001</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Scale Commands */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Scale Commands</h3>
          <p className="card-description">Send commands to the connected scale</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scaleCommands.map((command, index) => {
              const Icon = command.icon;
              return (
                <Button
                  key={index}
                  onClick={command.action}
                  isLoading={command.loading}
                  disabled={!isConnected && command.name !== 'Test Connection'}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  leftIcon={<Icon className="w-5 h-5" />}
                >
                  <span className="font-semibold">{command.name}</span>
                  <span className="text-xs text-gray-500 text-center">
                    {command.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Serial Ports */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Available Serial Ports</h3>
          <p className="card-description">Detected serial devices on your system</p>
        </div>
        <div className="card-content">
          <Table
            columns={serialPortColumns}
            data={serialPorts}
            isLoading={portsLoading}
            emptyText="No serial ports detected"
          />
        </div>
      </div>

      {/* Scale Configuration Modal */}
      <ScaleConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </div>
  );
};

export default ScaleTab;


