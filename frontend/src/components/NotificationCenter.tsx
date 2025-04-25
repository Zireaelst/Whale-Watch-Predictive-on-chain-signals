import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Divider,
  Badge,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useSignals } from '../context/AppContext';
import { Signal } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface StoredNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  priority: number;
  signal?: Signal;
}

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ open, onClose }) => {
  const signals = useSignals();
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load stored notifications from localStorage
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  useEffect(() => {
    // Update unread count
    const lastRead = localStorage.getItem('lastNotificationRead');
    const lastReadTime = lastRead ? new Date(lastRead).getTime() : 0;
    
    setUnreadCount(
      notifications.filter(n => new Date(n.timestamp).getTime() > lastReadTime).length
    );
  }, [notifications]);

  const handleNotificationClick = useCallback((notification: StoredNotification) => {
    if (notification.signal) {
      // Handle signal-related notification clicks
      // This could open the signal details dialog
    }
  }, []);

  const handleDeleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
    localStorage.setItem('notifications', '[]');
  }, []);

  const markAllAsRead = useCallback(() => {
    localStorage.setItem('lastNotificationRead', new Date().toISOString());
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (open) {
      markAllAsRead();
    }
  }, [open, markAllAsRead]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } } }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Notifications
            {unreadCount > 0 && (
              <Chip
                size="small"
                label={`${unreadCount} new`}
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <IconButton onClick={handleClearAll} title="Clear all notifications">
            <ClearIcon />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No notifications"
              secondary="New notifications will appear here"
            />
          </ListItem>
        ) : (
          notifications.map(notification => (
            <React.Fragment key={notification.id}>
              <ListItem
                button
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="textSecondary">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Delete notification">
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteNotification(notification.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
    </Drawer>
  );
};

export default NotificationCenter;