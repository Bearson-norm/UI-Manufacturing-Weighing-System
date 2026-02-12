import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProductionState, TabConfig } from '../types';
import { 
  PlayCircle, 
  ClipboardList, 
  Package, 
  Settings, 
  BarChart3, 
  FileText,
  Scale
} from 'lucide-react';

// App State
interface AppState {
  activeTab: string;
  production: ProductionState;
  isLoading: boolean;
  error: string | null;
}

// Action Types
type AppAction =
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SELECTED_MO'; payload: number | null }
  | { type: 'SET_CURRENT_MATERIAL_INDEX'; payload: number }
  | { type: 'ADD_CAPTURED_WEIGHT'; payload: { material: string; weight: number } }
  | { type: 'CLEAR_CAPTURED_WEIGHTS' }
  | { type: 'SET_IS_ACTIVE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_PRODUCTION' };

// Initial State
const initialState: AppState = {
  activeTab: 'production',
  production: {
    selectedMO: null,
    currentMaterialIndex: 0,
    capturedWeights: [],
    isActive: false,
  },
  isLoading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_SELECTED_MO':
      return {
        ...state,
        production: {
          ...state.production,
          selectedMO: action.payload,
          currentMaterialIndex: 0,
          capturedWeights: [],
        },
      };
    
    case 'SET_CURRENT_MATERIAL_INDEX':
      return {
        ...state,
        production: {
          ...state.production,
          currentMaterialIndex: action.payload,
        },
      };
    
    case 'ADD_CAPTURED_WEIGHT':
      return {
        ...state,
        production: {
          ...state.production,
          capturedWeights: [...state.production.capturedWeights, action.payload],
        },
      };
    
    case 'CLEAR_CAPTURED_WEIGHTS':
      return {
        ...state,
        production: {
          ...state.production,
          capturedWeights: [],
        },
      };
    
    case 'SET_IS_ACTIVE':
      return {
        ...state,
        production: {
          ...state.production,
          isActive: action.payload,
        },
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'RESET_PRODUCTION':
      return {
        ...state,
        production: {
          selectedMO: null,
          currentMaterialIndex: 0,
          capturedWeights: [],
          isActive: false,
        },
      };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  tabs: TabConfig[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Tab Configuration
const tabs: TabConfig[] = [
  { id: 'production', label: 'Produksi', icon: PlayCircle },
  { id: 'mo', label: 'Kelola MO', icon: ClipboardList },
  { id: 'sku', label: 'Kelola SKU', icon: Package },
  { id: 'bom', label: 'Kelola BOM', icon: Settings },
  { id: 'scale', label: 'Scale', icon: Scale },
  { id: 'monitor', label: 'Monitor', icon: BarChart3 },
  { id: 'history', label: 'Riwayat', icon: FileText },
];

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value: AppContextType = {
    state,
    dispatch,
    tabs,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;

