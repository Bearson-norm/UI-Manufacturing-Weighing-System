import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'react-query';
import { scaleApi, ScaleStatus, ScaleConfig } from '../services/scaleApi';
import toast from 'react-hot-toast';

export const useScale = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isStable, setIsStable] = useState(false);
  const [unit, setUnit] = useState('kg');

  // Get scale status
  const { data: scaleStatus, refetch: refetchStatus } = useQuery(
    'scale-status',
    scaleApi.getStatus,
    {
      refetchInterval: 1000, // Poll every second
      onSuccess: (data: ScaleStatus) => {
        setIsConnected(data.connected);
        setCurrentWeight(data.weight);
        setIsStable(data.stable);
      },
      onError: () => {
        setIsConnected(false);
      },
    }
  );

  // Connect to scale
  const connectMutation = useMutation(
    (config: ScaleConfig) => scaleApi.connect(config),
    {
      onSuccess: (response) => {
        if (response.success) {
          setIsConnected(true);
          toast.success('Scale connected successfully');
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to connect to scale');
      },
    }
  );

  // Disconnect from scale
  const disconnectMutation = useMutation(
    scaleApi.disconnect,
    {
      onSuccess: (response) => {
        if (response.success) {
          setIsConnected(false);
          setCurrentWeight(0);
          setIsStable(false);
          toast.success('Scale disconnected');
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to disconnect from scale');
      },
    }
  );

  // Tare scale
  const tareMutation = useMutation(
    scaleApi.tare,
    {
      onSuccess: (response) => {
        if (response.success) {
          toast.success('Scale tared');
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to tare scale');
      },
    }
  );

  // Zero scale
  const zeroMutation = useMutation(
    scaleApi.zero,
    {
      onSuccess: (response) => {
        if (response.success) {
          toast.success('Scale zeroed');
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to zero scale');
      },
    }
  );

  // Request weight
  const requestWeightMutation = useMutation(
    scaleApi.requestWeight,
    {
      onSuccess: (response) => {
        if (!response.success) {
          toast.error(response.message);
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to request weight');
      },
    }
  );

  // Test connection
  const testConnectionMutation = useMutation(
    scaleApi.testConnection,
    {
      onSuccess: (response) => {
        if (response.success) {
          toast.success('Scale test successful');
        } else {
          toast.error(response.message);
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Scale test failed');
      },
    }
  );

  // Connect to scale
  const connect = useCallback((config: ScaleConfig) => {
    connectMutation.mutate(config);
  }, [connectMutation]);

  // Disconnect from scale
  const disconnect = useCallback(() => {
    disconnectMutation.mutate();
  }, [disconnectMutation]);

  // Tare scale
  const tare = useCallback(() => {
    tareMutation.mutate();
  }, [tareMutation]);

  // Zero scale
  const zero = useCallback(() => {
    zeroMutation.mutate();
  }, [zeroMutation]);

  // Request weight
  const requestWeight = useCallback(() => {
    requestWeightMutation.mutate();
  }, [requestWeightMutation]);

  // Test connection
  const testConnection = useCallback(() => {
    testConnectionMutation.mutate();
  }, [testConnectionMutation]);

  return {
    // State
    isConnected,
    currentWeight,
    isStable,
    unit,
    scaleStatus,

    // Actions
    connect,
    disconnect,
    tare,
    zero,
    requestWeight,
    testConnection,
    refetchStatus,

    // Loading states
    isConnecting: connectMutation.isLoading,
    isDisconnecting: disconnectMutation.isLoading,
    isTaring: tareMutation.isLoading,
    isZeroing: zeroMutation.isLoading,
    isRequestingWeight: requestWeightMutation.isLoading,
    isTesting: testConnectionMutation.isLoading,
  };
};


