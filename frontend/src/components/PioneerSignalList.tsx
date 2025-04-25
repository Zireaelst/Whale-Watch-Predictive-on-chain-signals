import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Collapse,
  Tooltip,
  Link,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  Timeline,
  Assessment,
  CompareArrows,
  House,
  AccountBalance,
  ExpandMore,
  ExpandLess,
  OpenInNew,
  Refresh
} from '@mui/icons-material';
import { usePioneer } from '../context/PioneerContext';
import { pioneerApi } from '../services/api';
import { PioneerSignal, PioneerCategory } from '../types';

const categoryIcons: Record<PioneerCategory, React.ReactElement> = {
  'Protocol_Scout': <Timeline />,
  'Yield_Opportunist': <Assessment />,
  'Cross_Chain_Arbitrage': <CompareArrows />,
  'RWA_Innovation': <House />,
  'Treasury_Management': <AccountBalance />
};

interface SignalCardProps {
  signal: PioneerSignal;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const shortenAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Tooltip title={signal.category.replace('_', ' ')}>
              <IconButton size="small">
                {categoryIcons[signal.category]}
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item xs>
            <Typography variant="subtitle1">
              {signal.pattern.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(signal.timestamp).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item>
            <Chip
              label={`${(signal.pattern.confidence * 100).toFixed(0)}%`}
              color={getConfidenceColor(signal.pattern.confidence)}
              size="small"
              sx={{ mr: 1 }}
            />
            <IconButton
              onClick={handleExpandClick}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Grid>
        </Grid>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" paragraph>
              {signal.analysis.summary}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Pioneer Wallet
                </Typography>
                <Link 
                  href={`https://etherscan.io/address/${signal.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  {shortenAddress(signal.walletAddress)}
                  <OpenInNew sx={{ ml: 0.5, fontSize: 14 }} />
                </Link>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Transaction
                </Typography>
                <Link 
                  href={`https://etherscan.io/tx/${signal.transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  {shortenAddress(signal.transaction.hash)}
                  <OpenInNew sx={{ ml: 0.5, fontSize: 14 }} />
                </Link>
              </Grid>
              
              {signal.analysis.potentialImpact && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Potential Impact
                  </Typography>
                  <Typography variant="body2">
                    {signal.analysis.potentialImpact}
                  </Typography>
                </Grid>
              )}
              
              {signal.analysis.relatedTokens && signal.analysis.relatedTokens.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Related Tokens
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {signal.analysis.relatedTokens.map((token, index) => (
                      <Chip
                        key={index}
                        label={token}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Grid>
              )}
              
              {signal.analysis.strategicContext && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Strategic Context
                  </Typography>
                  <Typography variant="body2">
                    {signal.analysis.strategicContext}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Pioneer Metrics
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                  <Chip
                    size="small"
                    label={`Success Rate: ${(signal.metrics.historicalAccuracy * 100).toFixed(1)}%`}
                    color={getConfidenceColor(signal.metrics.historicalAccuracy)}
                  />
                  <Chip
                    size="small"
                    label={`Pattern Reliability: ${(signal.metrics.patternReliability * 100).toFixed(1)}%`}
                    color={getConfidenceColor(signal.metrics.patternReliability)}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export const PioneerSignalList: React.FC = () => {
  const { filters } = usePioneer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signals, setSignals] = useState<PioneerSignal[]>([]);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pioneerApi.getPioneers(filters);
      // For now, we're assuming the response includes signals
      // In a real implementation, you'd have a separate endpoint for signals
      setSignals(response.signals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pioneer signals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, [filters]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading signals...
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
            onClick={fetchSignals}
          >
            <Refresh />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  if (signals.length === 0) {
    return (
      <Alert severity="info">
        No pioneer signals found matching your criteria
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Pioneer Signals ({signals.length})
      </Typography>
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </Box>
  );
};