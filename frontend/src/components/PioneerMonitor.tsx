import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Container,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { PioneerList } from './PioneerList';
import { PioneerSignalList } from './PioneerSignalList';
import { PioneerMetrics } from './PioneerMetrics';
import { PioneerSettings } from './PioneerSettings';
import { PioneerFilters } from './PioneerFilters';
import { usePioneer } from '../context/PioneerContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`pioneer-tabpanel-${index}`}
    aria-labelledby={`pioneer-tab-${index}`}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </Box>
);

export const PioneerMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { activePioneers, pioneerMetrics } = usePioneer();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Calculate aggregate metrics for display
  const aggregateMetrics = activePioneers.reduce(
    (acc, address) => {
      const metrics = pioneerMetrics[address];
      if (metrics) {
        acc.totalTransactions += metrics.totalTransactions;
        acc.avgSuccessRate += metrics.successRate;
        acc.earlyAdoptionSuccess += metrics.earlyAdoptionSuccess;
        acc.yieldOptimizationROI += metrics.yieldOptimizationROI;
        acc.crossChainEfficiency += metrics.crossChainEfficiency;
        acc.rwaInnovationScore += metrics.rwaInnovationScore;
        acc.treasuryManagementScore += metrics.treasuryManagementScore;
      }
      return acc;
    },
    {
      totalTransactions: 0,
      avgSuccessRate: 0,
      earlyAdoptionSuccess: 0,
      yieldOptimizationROI: 0,
      crossChainEfficiency: 0,
      rwaInnovationScore: 0,
      treasuryManagementScore: 0
    }
  );

  // Normalize aggregate metrics
  const pioneerCount = activePioneers.length || 1;
  const normalizedMetrics = {
    successRate: aggregateMetrics.avgSuccessRate / pioneerCount,
    earlyAdoptionSuccess: aggregateMetrics.earlyAdoptionSuccess / pioneerCount,
    yieldOptimizationROI: aggregateMetrics.yieldOptimizationROI / pioneerCount,
    crossChainEfficiency: aggregateMetrics.crossChainEfficiency / pioneerCount,
    rwaInnovationScore: aggregateMetrics.rwaInnovationScore / pioneerCount,
    treasuryManagementScore: aggregateMetrics.treasuryManagementScore / pioneerCount
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="pioneer monitor tabs"
            sx={{ flexGrow: 1 }}
          >
            <Tab label="Overview" id="pioneer-tab-0" />
            <Tab label="Pioneers" id="pioneer-tab-1" />
            <Tab label="Signals" id="pioneer-tab-2" />
          </Tabs>
          <Box sx={{ px: 2 }}>
            <Tooltip title="Filter">
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'default'}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton
                onClick={() => setShowSettings(!showSettings)}
                color={showSettings ? 'primary' : 'default'}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container>
          <Grid item xs={showFilters || showSettings ? 9 : 12}>
            <TabPanel value={activeTab} index={0}>
              <PioneerMetrics
                metrics={normalizedMetrics}
                totalTransactions={aggregateMetrics.totalTransactions}
              />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <PioneerList />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <PioneerSignalList />
            </TabPanel>
          </Grid>

          {(showFilters || showSettings) && (
            <Grid item xs={3} sx={{ borderLeft: 1, borderColor: 'divider' }}>
              <Box sx={{ p: 2 }}>
                {showFilters && <PioneerFilters />}
                {showSettings && <PioneerSettings />}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};