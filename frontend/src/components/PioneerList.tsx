import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Timeline,
  Assessment,
  CompareArrows,
  House,
  AccountBalance,
  Refresh
} from '@mui/icons-material';
import { usePioneerData } from '../hooks/usePioneerData';
import { PioneerMetrics } from './PioneerMetrics';

const categoryIcons = {
  Protocol_Scout: <Timeline />,
  Yield_Opportunist: <Assessment />,
  Cross_Chain_Arbitrage: <CompareArrows />,
  RWA_Innovation: <House />,
  Treasury_Management: <AccountBalance />
};

export const PioneerList: React.FC = () => {
  const { loading, error, pioneers, refresh } = usePioneerData();

  if (loading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading pioneers...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error"
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={refresh}
          >
            <Refresh />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  if (pioneers.length === 0) {
    return (
      <Alert severity="info">
        No pioneers found matching your criteria
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Active Pioneers ({pioneers.length})
      </Typography>

      <Grid container spacing={2}>
        {pioneers.map(pioneer => (
          <Grid item xs={12} key={pioneer.address}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">
                        {pioneer.address.slice(0, 6)}...{pioneer.address.slice(-4)}
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        {pioneer.categories.map(category => (
                          <Tooltip key={category} title={category.replace('_', ' ')}>
                            <IconButton size="small" sx={{ mr: 0.5 }}>
                              {categoryIcons[category]}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <PioneerMetrics
                      metrics={pioneer.metrics}
                      totalTransactions={pioneer.metrics.totalTransactions}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};