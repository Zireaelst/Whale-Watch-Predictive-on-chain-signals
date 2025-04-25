import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Wallet } from '../types';

interface WalletMonitorProps {
  wallets: Wallet[];
  onAddWallet: (address: string) => Promise<void>;
  onRemoveWallet: (address: string) => Promise<void>;
}

const WalletMonitor: React.FC<WalletMonitorProps> = ({
  wallets,
  onAddWallet,
  onRemoveWallet
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [inputError, setInputError] = useState('');

  const handleAddWallet = async () => {
    if (!newWalletAddress) {
      setInputError('Please enter a wallet address');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress)) {
      setInputError('Invalid Ethereum address format');
      return;
    }

    try {
      await onAddWallet(newWalletAddress);
      setNewWalletAddress('');
      setOpenDialog(false);
      setInputError('');
    } catch (error) {
      setInputError('Error adding wallet: ' + (error as Error).message);
    }
  };

  const formatPerformance = (wallet: Wallet) => {
    const { profitableTrades, totalTrades } = wallet.performanceMetrics;
    const successRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;
    return `${successRate.toFixed(1)}%`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Monitored Wallets</Typography>
        <IconButton color="primary" onClick={() => setOpenDialog(true)}>
          <AddIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {wallets.map((wallet) => (
          <Grid item xs={12} sm={6} md={4} key={wallet.address}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" noWrap>
                    {wallet.label || `${wallet.address.substring(0, 6)}...${wallet.address.substring(38)}`}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onRemoveWallet(wallet.address)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Box mt={1}>
                  {wallet.category.map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>

                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Success Rate
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Box width="100%" mr={1}>
                      <LinearProgress
                        variant="determinate"
                        value={wallet.successRate * 100}
                        color={wallet.successRate >= 0.7 ? "success" : "primary"}
                      />
                    </Box>
                    <Typography variant="body2">
                      {formatPerformance(wallet)}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" mt={1}>
                  Total Transactions: {wallet.totalTransactions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Wallet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Wallet Address"
            fullWidth
            value={newWalletAddress}
            onChange={(e) => setNewWalletAddress(e.target.value)}
            error={!!inputError}
            helperText={inputError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddWallet} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletMonitor;