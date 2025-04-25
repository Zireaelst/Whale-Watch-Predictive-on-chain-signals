import React, { useEffect, useState } from 'react';
import { keyboardShortcuts } from '../utils/keyboardShortcuts';

const KeyboardShortcutsHelp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const shortcuts = keyboardShortcuts.getShortcuts();

  useEffect(() => {
    const handleToggle = () => setIsVisible(prev => !prev);
    window.addEventListener('toggle-shortcuts-help', handleToggle);
    return () => window.removeEventListener('toggle-shortcuts-help', handleToggle);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Keyboard Shortcuts</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
            >
              <span className="text-gray-600 dark:text-gray-300">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-sm font-semibold bg-gray-100 dark:bg-gray-700 rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;