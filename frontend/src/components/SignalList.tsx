import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Signal } from '../types';

interface SignalListProps {
  signals: Signal[];
  onSignalClick: (signal: Signal) => void;
}

const SignalList: React.FC<SignalListProps> = ({ signals, onSignalClick }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getPriorityColor = (priority: number): string => {
    if (priority >= 8) return 'error';
    if (priority >= 5) return 'warning';
    return 'info';
  };

  return (
    <Paper elevation={3}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Priority</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Protocol</TableCell>
              <TableCell>Pattern</TableCell>
              <TableCell>Wallet</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {signals
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((signal) => (
                <TableRow key={signal.id} hover>
                  <TableCell>
                    <Chip
                      label={signal.priority}
                      color={getPriorityColor(signal.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{signal.type}</TableCell>
                  <TableCell>{signal.protocol}</TableCell>
                  <TableCell>
                    <Chip
                      label={signal.pattern.name}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={signal.walletAddress}>
                      <span>
                        {`${signal.walletAddress.substring(0, 6)}...${signal.walletAddress.substring(38)}`}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onSignalClick(signal)}>
                      <InfoIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={signals.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default SignalList;