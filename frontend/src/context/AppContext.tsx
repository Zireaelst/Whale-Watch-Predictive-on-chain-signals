import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Signal, Wallet } from '../types';
import apiService from '../services/api';
import notificationService from '../services/NotificationService';

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
    apiService.connectWebSocket();

    // Set up WebSocket event handlers
    apiService.addMessageHandler('new_signal', (data) => {
      const signal = data.signal;
      dispatch({ type: 'ADD_SIGNAL', payload: signal });
      notificationService.notifyNewSignal(signal);
    });

    apiService.addMessageHandler('connection_status', (data) => {
      const isConnected = data.connected;
      dispatch({ type: 'SET_CONNECTION', payload: isConnected });
      notificationService.notifyConnectionStatus(isConnected);
    });

    // Load initial data
    const loadInitialData = async () => {
      try {
        const [signalsData, walletsData] = await Promise.all([
          apiService.getSignals(),
          apiService.getWallets(),
        ]);

        dispatch({ type: 'SET_SIGNALS', payload: signalsData.signals });
        dispatch({ type: 'SET_WALLETS', payload: walletsData.wallets });
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
      apiService.disconnect();
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