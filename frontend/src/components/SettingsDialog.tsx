import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Slider,
  Typography,
  Divider,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  InputLabel,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import settingsService from '../services/SettingsService';
import { useThemeContext } from '../context/ThemeContext';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const [settings, setSettings] = useState(settingsService.getSettings());
  const { themeMode, toggleTheme } = useThemeContext();

  const handleNotificationChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [field]: event.target.checked,
      },
    };
    setSettings(newSettings);
    settingsService.updateSettings(newSettings);
  };

  const handlePriorityChange = (event: Event, value: number | number[]) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        minPriority: value as number,
      },
    };
    setSettings(newSettings);
    settingsService.updateSettings(newSettings);
  };

  const handleConfidenceChange = (event: Event, value: number | number[]) => {
    const newSettings = {
      ...settings,
      filters: {
        ...settings.filters,
        minConfidence: (value as number) / 100,
      },
    };
    setSettings(newSettings);
    settingsService.updateSettings(newSettings);
  };

  const handleProtocolsChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const newSettings = {
      ...settings,
      filters: {
        ...settings.filters,
        protocols: event.target.value as string[],
      },
    };
    setSettings(newSettings);
    settingsService.updateSettings(newSettings);
  };

  const handleCategoriesChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const newSettings = {
      ...settings,
      filters: {
        ...settings.filters,
        walletCategories: event.target.value as string[],
      },
    };
    setSettings(newSettings);
    settingsService.updateSettings(newSettings);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={toggleTheme}
                  icon={<Brightness7 />}
                  checkedIcon={<Brightness4 />}
                />
              }
              label="Dark Mode"
            />
          </FormGroup>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.enabled}
                  onChange={handleNotificationChange('enabled')}
                />
              }
              label="Enable Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.desktopNotifications}
                  onChange={handleNotificationChange('desktopNotifications')}
                />
              }
              label="Desktop Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.soundEnabled}
                  onChange={handleNotificationChange('soundEnabled')}
                />
              }
              label="Sound Notifications"
            />
          </FormGroup>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Minimum Priority</Typography>
            <Slider
              value={settings.notifications.minPriority}
              onChange={handlePriorityChange}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Minimum Confidence</Typography>
            <Slider
              value={settings.filters.minConfidence * 100}
              onChange={handleConfidenceChange}
              min={0}
              max={100}
              step={5}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Box>

          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Protocols</InputLabel>
            <Select
              multiple
              value={settings.filters.protocols}
              onChange={handleProtocolsChange}
              input={<OutlinedInput label="Protocols" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="Uniswap">Uniswap</MenuItem>
              <MenuItem value="Aave">Aave</MenuItem>
              <MenuItem value="Curve">Curve</MenuItem>
              <MenuItem value="Compound">Compound</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Wallet Categories</InputLabel>
            <Select
              multiple
              value={settings.filters.walletCategories}
              onChange={handleCategoriesChange}
              input={<OutlinedInput label="Wallet Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="Scout">Scout</MenuItem>
              <MenuItem value="YieldFarmer">Yield Farmer</MenuItem>
              <MenuItem value="Arbitrageur">Arbitrageur</MenuItem>
              <MenuItem value="LiquidityProvider">Liquidity Provider</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;