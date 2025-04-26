import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Signal } from '../types';
import { pioneerApi } from '../services/api';
import notificationService from '../services/NotificationService';

interface Wallet {
  address: string;
  // Add other wallet properties as needed
}

interface AppState {
  signals: Signal[];
  wallets: Wallet[];
  isConnected: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_SIGNALS'; payload: Signal[] }
  | { type: 'ADD_SIGNAL'; payload: Signal }
  | { type: 'SET_WALLETS'; payload: Wallet[] }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'REMOVE_WALLET'; payload: string }
  | { type: 'SET_CONNECTION'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  signals: [],
  wallets: [],
  isConnected: false,
  error: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SIGNALS':
      return { ...state, signals: action.payload };
    case 'ADD_SIGNAL':
      return { ...state, signals: [action.payload, ...state.signals] };
    case 'SET_WALLETS':
      return { ...state, wallets: action.payload };
    case 'ADD_WALLET':
      return { ...state, wallets: [...state.wallets, action.payload] };
    case 'REMOVE_WALLET':
      return {
        ...state,
        wallets: state.wallets.filter((w) => w.address !== action.payload),
      };
    case 'SET_CONNECTION':
      return { ...state, isConnected: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();

    // Initialize WebSocket connection


    // Set up WebSocket event handlers
    interface NewSignalData {
      signal: Signal;
    }

    pioneerApi.addMessageHandler<NewSignalData>('new_signal', (data: NewSignalData) => {
      const signal: Signal = data.signal;
      dispatch({ type: 'ADD_SIGNAL', payload: signal });
      notificationService.notifyNewSignal(signal);
    });

    interface ConnectionStatusData {
      connected: boolean;
    }

        pioneerApi.addMessageHandler<ConnectionStatusData>('connection_status', (data: ConnectionStatusData) => {
          const isConnected: boolean = data.connected;
          dispatch({ type: 'SET_CONNECTION', payload: isConnected });
          notificationService.notifyConnectionStatus(isConnected);
        });

    // Load initial data
    const loadInitialData = async () => {
      try {
        const signalsData = await pioneerApi.getSignals();
        dispatch({ type: 'SET_SIGNALS', payload: signalsData.signals });
        // Initialize with empty wallets array for now
        dispatch({ type: 'SET_WALLETS', payload: [] });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to load initial data',
        });
      }
    };

    loadInitialData();

    // Cleanup
    return () => {
      // Close WebSocket connection if it exists
      const ws = pioneerApi.connectWebSocket();
      ws.close();
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useSignals() {
  const { state } = useApp();
  return state.signals;
}

export function useWallets() {
  const { state } = useApp();
  return state.wallets;
}

export function useConnection() {
  const { state } = useApp();
  return state.isConnected;
}

export function useAppError() {
  const { state } = useApp();
  return state.error;
}