import React, { useState } from 'react';
import { Container, Box, Paper, Tab, Tabs, Grid } from '@mui/material';
import { PioneerList } from '../components/PioneerList';
import { PioneerSignalList } from '../components/PioneerSignalList';
import SignalList from '../components/SignalList';
import { PioneerProvider } from '../context/PioneerContext';
import { Signal } from '../types';
import { useApp } from '../context/AppContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { state } = useApp();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSignalClick = (signal: Signal) => {
    // Handle signal click - you can implement this based on your requirements
    console.log('Signal clicked:', signal);
  };

  return (
    <PioneerProvider>
      <Container maxWidth="xl">
        <Box sx={{ width: '100%', mt: 3 }}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Pioneer Tracking" {...a11yProps(0)} />
              <Tab label="Pioneer Signals" {...a11yProps(1)} />
              <Tab label="All Signals" {...a11yProps(2)} />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <PioneerList />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <PioneerSignalList />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <SignalList signals={state.signals} onSignalClick={handleSignalClick} />
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Box>
      </Container>
    </PioneerProvider>
  );
};