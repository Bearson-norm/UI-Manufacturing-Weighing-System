import React, { useState, useEffect } from 'react';
import { Scale, Settings, RotateCcw, Zap } from 'lucide-react';
import { ProductionMaterial } from '../../types';
import { useScale } from '../../hooks/useScale';
import Button from '../ui/Button';
import ScaleConfigModal from '../scale/ScaleConfig';
import toast from 'react-hot-toast';

interface DigitalScaleProps {
  onWeightCapture: (weight: number) => void;
  currentMaterial: ProductionMaterial | null;
  isActive: boolean;
}

const DigitalScale: React.FC<DigitalScaleProps> = ({
  onWeightCapture,
  currentMaterial,
  isActive,
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [lastCapturedWeight, setLastCapturedWeight] = useState(0);
  
  const {
    isConnected,
    currentWeight,
    isStable,
    unit,
    tare,
    zero,
    requestWeight,
    isTaring,
    isZeroing,
  } = useScale();

  // Handle weight capture
  const handleCapture = () => {
    if (isStable && currentWeight > 0 && isConnected) {
      onWeightCapture(currentWeight);
      setLastCapturedWeight(currentWeight);
      toast.success(`Weight captured: ${currentWeight.toFixed(3)} ${unit}`);
    } else if (!isConnected) {
      toast.error('Scale not connected');
    } else if (!isStable) {
      toast.error('Weight not stable');
    } else {
      toast.error('Invalid weight reading');
    }
  };

  // Handle tare
  const handleTare = () => {
    tare();
  };

  // Handle zero
  const handleZero = () => {
    zero();
  };

  // Request weight reading
  const handleRequestWeight = () => {
    requestWeight();
  };

  return (
    <>
      <div className="bg-gray-800 text-white rounded-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary-400" />
            <h3 className="text-lg font-semibold">AND Digital Scale</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success-400' : 'bg-danger-400'} animate-pulse`} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfig(true)}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Config
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-4 p-3 rounded-lg bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Status:</span>
            <span className={`text-sm font-semibold ${isConnected ? 'text-success-400' : 'text-danger-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {isConnected && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-400">Stability:</span>
              <span className={`text-sm font-semibold ${isStable ? 'text-success-400' : 'text-warning-400'}`}>
                {isStable ? 'Stable' : 'Unstable'}
              </span>
            </div>
          )}
        </div>

        {currentMaterial ? (
          <>
            <div className="bg-gray-900 rounded p-4 mb-4">
              <div className="text-sm text-gray-400 mb-1">Material Saat Ini:</div>
              <div className="text-lg font-semibold">{currentMaterial.name}</div>
              <div className="text-sm text-primary-400">
                Target: {currentMaterial.target} {currentMaterial.uom}
              </div>
            </div>

            <div className="bg-black rounded-lg p-8 mb-4 text-center">
              <div className="text-6xl font-bold font-mono text-success-400">
                {isConnected ? currentWeight.toFixed(3) : '---.---'}
              </div>
              <div className="text-2xl text-gray-400 mt-2">
                {isConnected ? unit : '---'}
              </div>
            </div>

            {/* Scale Controls */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                onClick={handleTare}
                disabled={!isConnected || isTaring}
                loading={isTaring}
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Tare
              </Button>
              <Button
                onClick={handleZero}
                disabled={!isConnected || isZeroing}
                loading={isZeroing}
                variant="outline"
                size="sm"
                leftIcon={<Zap className="w-4 h-4" />}
              >
                Zero
              </Button>
            </div>

            <button
              onClick={handleCapture}
              disabled={!isConnected || !isStable || currentWeight <= 0}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isConnected && isStable && currentWeight > 0
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {!isConnected ? 'Scale Not Connected' :
               !isStable ? 'Waiting for Stability...' :
               currentWeight <= 0 ? 'Invalid Reading' :
               'Capture Weight'}
            </button>

            {lastCapturedWeight > 0 && (
              <div className="mt-3 p-2 bg-success-900 rounded text-center">
                <div className="text-sm text-success-400">
                  Last Captured: {lastCapturedWeight.toFixed(3)} {unit}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Scale className="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p>Select MO and start production to activate scale</p>
            {!isConnected && (
              <p className="text-sm mt-2 text-warning-400">
                Scale not connected. Click Config to set up connection.
              </p>
            )}
          </div>
        )}
      </div>

      <ScaleConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
      />
    </>
  );
};

export default DigitalScale;
