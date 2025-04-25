import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  FormGroup,
  TextField,
  Divider,
  Stack
} from '@mui/material';
import { usePioneer } from '../context/PioneerContext';

export const PioneerSettings: React.FC = () => {
  const { settings, updateSettings } = usePioneer();

  const handleNotificationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = event.target;
    updateSettings({
      notificationSettings: {
        ...settings.notificationSettings,
        [name]: checked
      }
    });
  };

  const handleMinTransactionsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 0) {
      updateSettings({ minTransactions: value });
    }
  };

  const handleSuccessRateChange = (event: Event, value: number | number[]) => {
    updateSettings({ minSuccessRate: value as number });
  };

  const handleUpdateIntervalChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 60) { // Minimum 60 seconds
      updateSettings({ updateInterval: value });
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pioneer Settings
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography gutterBottom>Minimum Requirements</Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Minimum Transactions"
                type="number"
                value={settings.minTransactions}
                onChange={handleMinTransactionsChange}
                InputProps={{ inputProps: { min: 0 } }}
                size="small"
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Minimum number of transactions required to qualify as a pioneer
              </Typography>
            </Box>

            <Box>
              <Typography gutterBottom>
                Minimum Success Rate: {(settings.minSuccessRate * 100).toFixed(0)}%
              </Typography>
              <Slider
                value={settings.minSuccessRate}
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
          </Box>

          <Divider />

          <Box>
            <Typography gutterBottom>Update Settings</Typography>
            <TextField
              label="Update Interval (seconds)"
              type="number"
              value={settings.updateInterval}
              onChange={handleUpdateIntervalChange}
              InputProps={{ inputProps: { min: 60 } }}
              size="small"
              fullWidth
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              How often to refresh pioneer metrics (minimum 60 seconds)
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography gutterBottom>Notifications</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationSettings.protocolSignals}
                    onChange={handleNotificationChange}
                    name="protocolSignals"
                  />
                }
                label="Protocol Discovery Signals"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                Notify when pioneers discover new protocols
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationSettings.strategySignals}
                    onChange={handleNotificationChange}
                    name="strategySignals"
                  />
                }
                label="Strategy Deployment Signals"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                Notify when pioneers deploy new strategies
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationSettings.trendSignals}
                    onChange={handleNotificationChange}
                    name="trendSignals"
                  />
                }
                label="Trend Signals"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                Notify when pioneers show pattern-based behavior
              </Typography>
            </FormGroup>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};