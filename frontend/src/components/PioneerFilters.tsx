import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { usePioneer } from '../context/PioneerContext';
import {
  Timeline,
  Assessment,
  CompareArrows,
  House,
  AccountBalance
} from '@mui/icons-material';

const categories = [
  {
    id: 'Protocol_Scout',
    label: 'Protocol Scouts',
    icon: Timeline,
    color: '#4CAF50'
  },
  {
    id: 'Yield_Opportunist',
    label: 'Yield Opportunists',
    icon: Assessment,
    color: '#2196F3'
  },
  {
    id: 'Cross_Chain_Arbitrage',
    label: 'Cross-Chain Arbitrageurs',
    icon: CompareArrows,
    color: '#FF9800'
  },
  {
    id: 'RWA_Innovation',
    label: 'RWA Innovators',
    icon: House,
    color: '#9C27B0'
  },
  {
    id: 'Treasury_Management',
    label: 'Treasury Managers',
    icon: AccountBalance,
    color: '#795548'
  }
];

const chainsList = [
  { id: '1', name: 'Ethereum' },
  { id: '42161', name: 'Arbitrum' },
  { id: '10', name: 'Optimism' },
  { id: '137', name: 'Polygon' },
  { id: '43114', name: 'Avalanche' }
];

export const PioneerFilters: React.FC = () => {
  const { filters, updateFilters } = usePioneer();

  const handleCategoryChange = (categoryId: string) => {
    const updatedCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    updateFilters({ categories: updatedCategories });
  };

  const handleChainChange = (chainId: string) => {
    const updatedChains = filters.chains.includes(chainId)
      ? filters.chains.filter(id => id !== chainId)
      : [...filters.chains, chainId];
    updateFilters({ chains: updatedChains });
  };

  const handleSuccessRateChange = (event: Event, value: number | number[]) => {
    updateFilters({ minSuccessRate: value as number });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pioneer Filters
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Categories</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Chip
                  key={category.id}
                  icon={<Icon />}
                  label={category.label}
                  onClick={() => handleCategoryChange(category.id)}
                  sx={{
                    bgcolor: filters.categories.includes(category.id)
                      ? `${category.color}20`
                      : 'transparent',
                    borderColor: category.color,
                    '&:hover': {
                      bgcolor: `${category.color}40`
                    },
                    mb: 1
                  }}
                  variant={filters.categories.includes(category.id) ? "filled" : "outlined"}
                />
              );
            })}
          </Stack>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>Networks</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {chainsList.map(chain => (
              <Chip
                key={chain.id}
                label={chain.name}
                onClick={() => handleChainChange(chain.id)}
                sx={{
                  mb: 1
                }}
                variant={filters.chains.includes(chain.id) ? "filled" : "outlined"}
              />
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography gutterBottom>
            Minimum Success Rate: {(filters.minSuccessRate * 100).toFixed(0)}%
          </Typography>
          <Slider
            value={filters.minSuccessRate}
            onChange={handleSuccessRateChange}
            min={0}
            max={1}
            step={0.05}
            marks={[
              { value: 0, label: '0%' },
              { value: 0.5, label: '50%' },
              { value: 1, label: '100%' }
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
          />
        </Box>
      </CardContent>
    </Card>
  );
};