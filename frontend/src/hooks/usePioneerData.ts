import { useState, useEffect, useCallback } from 'react';
import { pioneerApi } from '../services/api';
import { PioneerCategory, PioneerMetrics } from '../types';
import { usePioneer } from '../context/PioneerContext';

interface UsePioneerDataReturn {
  loading: boolean;
  error: string | null;
  pioneers: Array<{
    address: string;
    metrics: PioneerMetrics;
    categories: PioneerCategory[];
  }>;
  refresh: () => Promise<void>;
}

export const usePioneerData = (): UsePioneerDataReturn => {
  const { filters } = usePioneer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pioneers, setPioneers] = useState<UsePioneerDataReturn['pioneers']>([]);

  const fetchPioneers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pioneerApi.getPioneers(filters);
      setPioneers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pioneer data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPioneers();
  }, [fetchPioneers]);

  return {
    loading,
    error,
    pioneers,
    refresh: fetchPioneers
  };
};

interface UsePioneerMetricsReturn {
  loading: boolean;
  error: string | null;
  metrics: PioneerMetrics | null;
  refresh: () => Promise<void>;
}

export const usePioneerMetrics = (address: string): UsePioneerMetricsReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PioneerMetrics | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pioneerApi.getPioneerMetrics(address);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pioneer metrics');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    loading,
    error,
    metrics,
    refresh: fetchMetrics
  };
};

interface UsePioneerActivityReturn {
  recordProtocolDiscovery: (protocol: string, success: boolean) => Promise<void>;
  recordStrategyDeployment: (type: string, success: boolean, roi?: number) => Promise<void>;
  updateChainActivity: (chain: string, success: boolean) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const usePioneerActivity = (address: string): UsePioneerActivityReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordProtocolDiscovery = async (protocol: string, success: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await pioneerApi.recordProtocolDiscovery(address, { protocol, success });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record protocol discovery');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const recordStrategyDeployment = async (type: string, success: boolean, roi?: number) => {
    try {
      setLoading(true);
      setError(null);
      await pioneerApi.recordStrategyDeployment(address, { type, success, roi });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record strategy deployment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateChainActivity = async (chain: string, success: boolean) => {
    try {
      setLoading(true);
      setError(null);
      await pioneerApi.updateChainActivity(address, { chain, success });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chain activity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    recordProtocolDiscovery,
    recordStrategyDeployment,
    updateChainActivity,
    loading,
    error
  };
};