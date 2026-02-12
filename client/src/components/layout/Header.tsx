import React from 'react';
import { useQuery } from 'react-query';
import { scaleApi } from '../../services/scaleApi';

const Header: React.FC = () => {
  // Get scale status for header display
  const { data: scaleStatus } = useQuery(
    'scale-status',
    scaleApi.getStatus,
    {
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 mb-6 mx-6 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-primary-600">⚖️</span>
            Manufacturing Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            AND Scales Integration Ready
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">System Status</div>
          <div className="flex items-center gap-2">
            <div className="text-green-600 font-semibold">✅ Online</div>
            {scaleStatus && (
              <div className={`text-xs px-2 py-1 rounded-full ${
                scaleStatus.connected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                Scale: {scaleStatus.connected ? 'Connected' : 'Disconnected'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;