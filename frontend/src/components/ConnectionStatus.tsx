import React from 'react';
import { Box, Chip } from '@mui/material';
import { WifiOff, Wifi } from '@mui/icons-material';
import { useConnection } from '../context/AppContext';

const ConnectionStatus: React.FC = () => {
  const isConnected = useConnection();

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1200 }}>
      <Chip
        icon={isConnected ? <Wifi /> : <WifiOff />}
        label={isConnected ? 'Connected' : 'Disconnected'}
        color={isConnected ? 'success' : 'error'}
        variant="outlined"
      />
    </Box>
  );
};

export default ConnectionStatus;