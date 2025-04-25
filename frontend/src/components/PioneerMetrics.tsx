import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Timeline,
  Assessment,
  CompareArrows,
  House,
  AccountBalance,
  Info
} from '@mui/icons-material';
import { PioneerMetrics as PioneerMetricsType } from '../types';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  color: string;
  tooltip: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  color,
  tooltip
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {icon}
        <Tooltip title={tooltip}>
          <IconButton size="small">
            <Info fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {(value * 100).toFixed(1)}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={value * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: `${color}20`,
            '& .MuiLinearProgress-bar': {
              bgcolor: color
            }
          }}
        />
      </Box>
    </CardContent>
  </Card>
);

interface PioneerMetricsProps {
  metrics: PioneerMetricsType;
  totalTransactions: number;
}

export const PioneerMetrics: React.FC<PioneerMetricsProps> = ({
  metrics,
  totalTransactions
}) => {
  const metricCards = [
    {
      title: 'Early Adoption Success',
      value: metrics.earlyAdoptionSuccess,
      icon: <Timeline sx={{ color: '#4CAF50' }} />,
      color: '#4CAF50',
      tooltip: 'Success rate in identifying early protocol opportunities'
    },
    {
      title: 'Yield Strategy ROI',
      value: metrics.yieldOptimizationROI,
      icon: <Assessment sx={{ color: '#2196F3' }} />,
      color: '#2196F3',
      tooltip: 'Average ROI from yield optimization strategies'
    },
    {
      title: 'Cross-Chain Efficiency',
      value: metrics.crossChainEfficiency,
      icon: <CompareArrows sx={{ color: '#FF9800' }} />,
      color: '#FF9800',
      tooltip: 'Success rate in cross-chain operations'
    },
    {
      title: 'RWA Innovation Score',
      value: metrics.rwaInnovationScore,
      icon: <House sx={{ color: '#9C27B0' }} />,
      color: '#9C27B0',
      tooltip: 'Performance in real-world asset strategies'
    },
    {
      title: 'Treasury Management',
      value: metrics.treasuryManagementScore,
      icon: <AccountBalance sx={{ color: '#795548' }} />,
      color: '#795548',
      tooltip: 'Efficiency in treasury operations and management'
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pioneer Performance Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Based on {totalTransactions} tracked transactions with {(metrics.successRate * 100).toFixed(1)}% success rate
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {metricCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <MetricCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};