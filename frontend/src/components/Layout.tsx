import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as WalletIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ConnectionStatus from './ConnectionStatus';
import SettingsDialog from './SettingsDialog';
import NotificationCenter from './NotificationCenter';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { useSignals } from '../context/AppContext';
import { keyboardShortcuts } from '../utils/keyboardShortcuts';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const signals = useSignals();

  // Register keyboard shortcuts
  useEffect(() => {
    keyboardShortcuts.register('ctrl+/', () => setSettingsOpen(true), 'Open Settings');
    keyboardShortcuts.register('ctrl+n', () => setNotificationsOpen(true), 'Open Notifications');
    keyboardShortcuts.register('?', () => setShortcutsHelpOpen(true), 'Show Keyboard Shortcuts');
    keyboardShortcuts.register('esc', () => {
      setSettingsOpen(false);
      setNotificationsOpen(false);
      setShortcutsHelpOpen(false);
    }, 'Close Dialog');

    return () => {
      keyboardShortcuts.unregister('ctrl+/');
      keyboardShortcuts.unregister('ctrl+n');
      keyboardShortcuts.unregister('?');
      keyboardShortcuts.unregister('esc');
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Wallets', icon: <WalletIcon />, path: '/wallets' },
    { text: 'Signals', icon: <NotificationsIcon />, path: '/signals' },
  ];

  const newSignalsCount = signals.filter(
    signal => new Date(signal.timestamp).getTime() > Date.now() - 300000 // Last 5 minutes
  ).length;

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          DeFi Pioneer Watch
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              {item.text === 'Signals' ? (
                <Badge badgeContent={newSignalsCount} color="secondary">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            DeFi Pioneer Watch
          </Typography>
          <Tooltip title="Keyboard Shortcuts (?)">
            <IconButton color="inherit" onClick={() => setShortcutsHelpOpen(true)}>
              <HelpIcon />
            </IconButton>
          </Tooltip>
          <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => setNotificationsOpen(true)}>
            <Badge badgeContent={newSignalsCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
      <ConnectionStatus />
      <SettingsDialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      <NotificationCenter
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <KeyboardShortcutsHelp
        open={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />
    </Box>
  );
};

export default Layout;