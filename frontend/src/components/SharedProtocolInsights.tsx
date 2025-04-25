import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  Security,
  Group,
  Refresh,
  ErrorOutline
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer
} from 'recharts';
import { pioneerApi } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

interface TVLTrendData {
  timestamp: Date;
  value: number;
}

interface ProtocolTrend {
  protocolAddress: string;
  protocolName: string;
  pioneerCount: number;
  avgSuccessRate: number;
  riskScore: number;
  tvlTrend: TVLTrendData[];
}

export const SharedProtocolInsights: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [trends, setTrends] = useState<ProtocolTrend[]>([]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pioneerApi.getProtocolTrends(timeframe);
      setTrends(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch protocol trends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [timeframe]);

  const handleTimeframeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeframe: '24h' | '7d' | '30d'
  ) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 0.3) return 'success';
    if (score <= 0.7) return 'warning';
    return 'error';
  };

  const formatTVLValue = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading protocol insights...
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
            onClick={fetchTrends}
          >
            <Refresh />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          Protocol Insights
        </Typography>
        <ToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={handleTimeframeChange}
          size="small"
        >
          <ToggleButton value="24h">24H</ToggleButton>
          <ToggleButton value="7d">7D</ToggleButton>
          <ToggleButton value="30d">30D</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2}>
        {trends.map(protocol => (
          <Grid item xs={12} key={protocol.protocolAddress}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">
                        {protocol.protocolName}
                      </Typography>
                      <Box>
                        <Tooltip title="Pioneer Count">
                          <Chip
                            icon={<Group />}
                            label={protocol.pioneerCount}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        </Tooltip>
                        <Tooltip title="Success Rate">
                          <Chip
                            icon={<TrendingUp />}
                            label={`${(protocol.avgSuccessRate * 100).toFixed(1)}%`}
                            color={protocol.avgSuccessRate >= 0.7 ? 'success' : 'default'}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        </Tooltip>
                        <Tooltip title="Risk Score">
                          <Chip
                            icon={<Security />}
                            label={`${(protocol.riskScore * 100).toFixed(0)}%`}
                            color={getRiskColor(protocol.riskScore)}
                            size="small"
                          />
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={protocol.tvlTrend}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={(time) => 
                              formatDistanceToNow(new Date(time), { addSuffix: true })
                            }
                          />
                          <YAxis
                            tickFormatter={formatTVLValue}
                          />
                          <ChartTooltip
                            formatter={(value: number) => [
                              formatTVLValue(value),
                              'TVL'
                            ]}
                            labelFormatter={(label) => 
                              new Date(label).toLocaleString()
                            }
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8884d8"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>

                  {protocol.riskScore > 0.7 && (
                    <Grid item xs={12}>
                      <Alert
                        severity="warning"
                        icon={<ErrorOutline />}
                        sx={{ mt: 1 }}
                      >
                        High risk detected. Exercise caution when interacting with this protocol.
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};