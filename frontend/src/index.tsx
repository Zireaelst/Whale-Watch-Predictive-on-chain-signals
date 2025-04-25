import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { keyboardShortcuts } from './utils/keyboardShortcuts';
import notificationService from './services/NotificationService';
import { audioManager } from './utils/audioUtils';

async function initializeApp() {
  try {
    // Initialize notification system
    await notificationService.initialize();
    
    // Initialize audio system
    await audioManager.initialize();

    // Enable keyboard shortcuts
    keyboardShortcuts.enable();

    // Create root and render app
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

// Initialize the application
initializeApp();

// Cleanup on unload
window.addEventListener('unload', () => {
  notificationService.cleanup();
  keyboardShortcuts.cleanup();
});