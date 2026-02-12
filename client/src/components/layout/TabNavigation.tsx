import React from 'react';
import { useApp } from '../../contexts/AppContext';

const TabNavigation: React.FC = () => {
  const { state, dispatch, tabs } = useApp();

  const handleTabChange = (tabId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = state.activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;