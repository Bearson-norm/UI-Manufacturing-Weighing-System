import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';

// Import tab components
import ProductionTab from './components/tabs/ProductionTab';
import MOTab from './components/tabs/MOTab';
import SKUTab from './components/tabs/SKUTab';
import BOMTab from './components/tabs/BOMTab';
import ScaleTab from './components/tabs/ScaleTab';
import MonitorTab from './components/tabs/MonitorTab';
import HistoryTab from './components/tabs/HistoryTab';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Main App Content Component
const AppContent: React.FC = () => {
  const { state } = useApp();

  const renderActiveTab = () => {
    switch (state.activeTab) {
      case 'production':
        return <ProductionTab />;
      case 'mo':
        return <MOTab />;
      case 'sku':
        return <SKUTab />;
      case 'bom':
        return <BOMTab />;
      case 'scale':
        return <ScaleTab />;
      case 'monitor':
        return <MonitorTab />;
      case 'history':
        return <HistoryTab />;
      default:
        return <ProductionTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <Header />

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <TabNavigation />

        {/* Main Content */}
        <div className="mt-6">
          {renderActiveTab()}
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;