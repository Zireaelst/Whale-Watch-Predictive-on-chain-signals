import axios from 'axios';
import { PioneerMetrics, PioneerCategory } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface ProtocolInteraction {
  protocolAddress: string;
  protocolName: string;
  pioneerAddress: string;
  success: boolean;
  relatedTokens?: string[];
}

export const pioneerApi = {
  getPioneers: async (filters?: {
    categories?: PioneerCategory[];
    minSuccessRate?: number;
    chains?: string[];
  }) => {
    const response = await axios.get(`${API_BASE_URL}/pioneers`, { params: filters });
    return response.data;
  },

  getPioneerMetrics: async (address: string) => {
    const response = await axios.get(`${API_BASE_URL}/pioneers/${address}/metrics`);
    return response.data as PioneerMetrics;
  },

  recordProtocolDiscovery: async (address: string, data: {
    protocol: string;
    success: boolean;
  }) => {
    const response = await axios.post(`/pioneers/${address}/protocol-discovery`, data);
    return response.data;
  },

  recordStrategyDeployment: async (address: string, data: {
    type: string;
    success: boolean;
    roi?: number;
  }) => {
    const response = await axios.post(`/pioneers/${address}/strategy-deployment`, data);
    return response.data;
  },

  updateChainActivity: async (address: string, data: {
    chain: string;
    success: boolean;
  }) => {
    const response = await axios.post(`/pioneers/${address}/chain-activity`, data);
    return response.data;
  },

  // Shared Protocol Methods
  async recordProtocolInteraction(data: ProtocolInteraction) {
    const response = await axios.post(
      `${API_BASE_URL}/pioneers/protocols/interaction`,
      data
    );
    return response.data;
  },

  async getProtocolTrends(timeframe: '24h' | '7d' | '30d' = '7d') {
    const response = await axios.get(
      `${API_BASE_URL}/pioneers/protocols/trends`,
      { params: { timeframe } }
    );
    return response.data;
  },

  async getRelatedPioneers(protocolAddress: string) {
    const response = await axios.get(
      `${API_BASE_URL}/pioneers/protocols/${protocolAddress}/pioneers`
    );
    return response.data;
  },

  async getPioneerProtocols(
    address: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 1 | -1;
    } = {}
  ) {
    const response = await axios.get(
      `${API_BASE_URL}/pioneers/${address}/protocols`,
      { params: options }
    );
    return response.data;
  }
};