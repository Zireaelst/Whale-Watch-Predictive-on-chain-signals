import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { keyboardShortcuts } from '../utils/keyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ open, onClose }) => {
  const shortcuts = keyboardShortcuts.getShortcuts();
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Keyboard Shortcuts</Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {categories.map(category => (
          <Box key={category} mb={2}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              {category}
            </Typography>
            <List dense>
              {shortcuts
                .filter(s => s.category === category)
                .map((shortcut, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={shortcut.description}
                      secondary={
                        <Chip
                          size="small"
                          label={[
                            shortcut.ctrlKey && 'Ctrl',
                            shortcut.altKey && 'Alt',
                            shortcut.shiftKey && 'Shift',
                            shortcut.key
                          ]
                            .filter(Boolean)
                            .join(' + ')}
                          variant="outlined"
                        />
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;