import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { AppProvider } from './context/AppContext';
import { AppThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <AppThemeProvider>
      <CssBaseline />
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </AppThemeProvider>
  );
};

export default App;