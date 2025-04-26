import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, Theme } from '@mui/material';
import settingsService from '../services/SettingsService';
import { ErrorHandler } from '../utils/errorHandler';
import LoadingSpinner from '../components/LoadingSpinner';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setLoading(true);
        const settings = await settingsService.getSettings();
        setThemeMode(settings.appearance.theme);
      } catch (err) {
        const errorDetails = ErrorHandler.handleError(err as Error);
        setError(errorDetails.message);
        // Default to light theme if there's an error
        setThemeMode('light');
      } finally {
        setLoading(false);
      }
    };

    initializeTheme();
  }, []);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: themeMode === 'light' ? '#f5f5f5' : '#121212',
            paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: themeMode === 'light' ? '#1976d2' : '#272727',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
              },
            },
          },
        },
      }),
    [themeMode]
  );

  const toggleTheme = async () => {
    try {
      const newMode = themeMode === 'light' ? 'dark' : 'light';
      await settingsService.updateSettings({
        appearance: { theme: newMode },
      });
      setThemeMode(newMode);
    } catch (err) {
      const errorDetails = ErrorHandler.handleError(err as Error);
      setError(errorDetails.message);
      // Show error in UI (you could use a snackbar or other notification)
      console.error('Failed to update theme:', errorDetails.message);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading theme..." />;
  }

  if (error) {
    // You could add a retry button or other error recovery UI here
    console.error('Theme initialization error:', error);
  }

  const value = {
    themeMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default ThemeContext;