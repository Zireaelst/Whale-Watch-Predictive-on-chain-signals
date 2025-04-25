import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { pioneerApi } from '../services/api';
import { SettingsService } from '../services/SettingsService';
import { ErrorHandler } from '../utils/errorHandler';
import { notificationQueue } from '../utils/NotificationQueue';
import {
  Pioneer,
  PioneerMetrics,
  PioneerFilters,
  PioneerSettings,
  PioneerContextType
} from '../types';

const PioneerContext = createContext<PioneerContextType | null>(null);

export const usePioneer = () => {
  const context = useContext(PioneerContext);
  if (!context) {
    throw new Error('usePioneer must be used within a PioneerProvider');
  }
  return context;
};

interface PioneerProviderProps {
  children: React.ReactNode;
}

export const PioneerProvider: React.FC<PioneerProviderProps> = ({ children }) => {
  const [activePioneers, setActivePioneers] = useState<string[]>([]);
  const [pioneerMetrics, setPioneerMetrics] = useState<Record<string, PioneerMetrics>>({});
  const [filters, setFilters] = useState<PioneerFilters>(SettingsService.getPioneerFilters());
  const [settings, setSettings] = useState<PioneerSettings>(SettingsService.getPioneerSettings());

  const updateFilters = useCallback((newFilters: Partial<PioneerFilters>) => {
    setFilters(current => {
      const updated = { ...current, ...newFilters };
      SettingsService.savePioneerFilters(updated);
      return updated;
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<PioneerSettings>) => {
    setSettings(current => {
      const updated = { ...current, ...newSettings };
      SettingsService.savePioneerSettings(updated);
      return updated;
    });
  }, []);

  const addPioneer = useCallback(async (address: string) => {
    try {
      // Verify the address meets minimum requirements
      const metrics = await pioneerApi.getPioneerMetrics(address);
      
      if (metrics.totalTransactions < settings.minTransactions) {
        throw new Error('insufficient transactions');
      }
      
      if (metrics.successRate < settings.minSuccessRate) {
        throw new Error('insufficient success rate');
      }

      setActivePioneers(current => {
        if (current.includes(address)) return current;
        return [...current, address];
      });

      setPioneerMetrics(current => ({
        ...current,
        [address]: metrics
      }));

      // Save to persistent storage
      const currentPioneers = JSON.parse(
        localStorage.getItem('activePioneers') || '[]'
      );
      if (!currentPioneers.includes(address)) {
        localStorage.setItem(
          'activePioneers',
          JSON.stringify([...currentPioneers, address])
        );
      }

      notificationQueue.add({
        id: Date.now().toString(),
        title: 'Pioneer Added',
        message: `Now tracking pioneer wallet: ${address.slice(0, 6)}...${address.slice(-4)}`,
        type: 'success',
        timestamp: Date.now(),
        priority: 2,
        read: false
      });
    } catch (error) {
      ErrorHandler.handlePioneerError(error as Error, { address });
      throw error;
    }
  }, [settings]);

  const removePioneer = useCallback(async (address: string) => {
    try {
      setActivePioneers(current => 
        current.filter(a => a !== address)
      );

      setPioneerMetrics(current => {
        const updated = { ...current };
        delete updated[address];
        return updated;
      });

      // Update persistent storage
      const currentPioneers = JSON.parse(
        localStorage.getItem('activePioneers') || '[]'
      );
      localStorage.setItem(
        'activePioneers',
        JSON.stringify(currentPioneers.filter((a: string) => a !== address))
      );

      notificationQueue.add({
        id: Date.now().toString(),
        title: 'Pioneer Removed',
        message: `Stopped tracking pioneer wallet: ${address.slice(0, 6)}...${address.slice(-4)}`,
        type: 'info',
        timestamp: Date.now(),
        priority: 1,
        read: false
      });
    } catch (error) {
      ErrorHandler.handlePioneerError(error as Error, { address });
      throw error;
    }
  }, []);

  // Load saved pioneers on mount
  useEffect(() => {
    const loadSavedPioneers = async () => {
      try {
        const savedPioneers = JSON.parse(
          localStorage.getItem('activePioneers') || '[]'
        );

        for (const address of savedPioneers) {
          try {
            const metrics = await pioneerApi.getPioneerMetrics(address);
            setPioneerMetrics(current => ({
              ...current,
              [address]: metrics
            }));
          } catch (error) {
            console.error(`Failed to load metrics for ${address}:`, error);
          }
        }

        setActivePioneers(savedPioneers);
      } catch (error) {
        console.error('Failed to load saved pioneers:', error);
      }
    };

    loadSavedPioneers();
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (activePioneers.length === 0) return;

    const updateMetrics = async () => {
      for (const address of activePioneers) {
        try {
          const metrics = await pioneerApi.getPioneerMetrics(address);
          setPioneerMetrics(current => ({
            ...current,
            [address]: metrics
          }));
        } catch (error) {
          console.error(`Failed to update metrics for ${address}:`, error);
        }
      }
    };

    const interval = setInterval(updateMetrics, settings.updateInterval * 1000);
    return () => clearInterval(interval);
  }, [activePioneers, settings.updateInterval]);

  // Subscribe to settings changes
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    const handleFiltersChange = (event: CustomEvent) => {
      setFilters(event.detail);
    };

    window.addEventListener(
      'pioneerSettingsChanged',
      handleSettingsChange as EventListener
    );
    window.addEventListener(
      'pioneerFiltersChanged',
      handleFiltersChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'pioneerSettingsChanged',
        handleSettingsChange as EventListener
      );
      window.removeEventListener(
        'pioneerFiltersChanged',
        handleFiltersChange as EventListener
      );
    };
  }, []);

  const value: PioneerContextType = {
    activePioneers,
    pioneerMetrics,
    filters,
    settings,
    updateFilters,
    updateSettings,
    addPioneer,
    removePioneer
  };

  return (
    <PioneerContext.Provider value={value}>
      {children}
    </PioneerContext.Provider>
  );
};