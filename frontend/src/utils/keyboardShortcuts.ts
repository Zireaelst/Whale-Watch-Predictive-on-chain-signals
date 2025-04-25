import { KeyboardShortcut } from '../types';

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Global Shortcuts
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    category: 'Global',
    action: () => {
      window.dispatchEvent(new Event('toggle-shortcuts-help'));
    },
  },
  {
    key: 'Escape',
    description: 'Close current dialog/modal',
    category: 'Global',
    action: () => {
      window.dispatchEvent(new Event('close-current-dialog'));
    },
  },
  {
    key: 'n',
    description: 'Toggle notification center',
    category: 'Global',
    action: () => {
      window.dispatchEvent(new Event('toggle-notifications'));
    },
  },
  {
    key: 's',
    description: 'Open settings',
    category: 'Global',
    action: () => {
      window.dispatchEvent(new Event('open-settings'));
    },
  },
  {
    key: 'm',
    description: 'Toggle sound notifications',
    category: 'Global',
    action: () => {
      window.dispatchEvent(new Event('toggle-sound'));
    },
  },

  // Pioneer Monitor Shortcuts
  {
    key: 'p',
    description: 'Open Pioneer Monitor',
    category: 'Navigation',
    ctrlKey: true
  },
  {
    key: '1',
    description: 'Switch to Overview Tab',
    category: 'Pioneer Monitor',
    altKey: true
  },
  {
    key: '2',
    description: 'Switch to Pioneers Tab',
    category: 'Pioneer Monitor',
    altKey: true
  },
  {
    key: '3',
    description: 'Switch to Signals Tab',
    category: 'Pioneer Monitor',
    altKey: true
  },
  {
    key: 'f',
    description: 'Toggle Filters Panel',
    category: 'Pioneer Monitor',
    altKey: true
  },
  {
    key: 's',
    description: 'Toggle Settings Panel',
    category: 'Pioneer Monitor',
    altKey: true
  },
  {
    key: 'r',
    description: 'Refresh Pioneer Data',
    category: 'Pioneer Monitor',
    altKey: true
  }
];