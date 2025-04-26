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

class KeyboardShortcutsManager {
    private enabled = false;
    private registeredShortcuts = new Map<string, KeyboardShortcut>();

    enable() {
        if (this.enabled) return;
        this.enabled = true;
        document.addEventListener('keydown', this.handleKeyPress);
    }

    cleanup() {
        this.enabled = false;
        document.removeEventListener('keydown', this.handleKeyPress);
        this.registeredShortcuts.clear();
    }

    getShortcuts() {
        return [...KEYBOARD_SHORTCUTS, ...Array.from(this.registeredShortcuts.values())];
    }

    register(shortcutKey: string, action: () => void, description: string) {
        const [key, ...modifiers] = shortcutKey.toLowerCase().split('+').reverse();
        const shortcut: KeyboardShortcut = {
            key,
            description,
            category: 'Dynamic',
            action,
            ctrlKey: modifiers.includes('ctrl'),
            altKey: modifiers.includes('alt'),
            shiftKey: modifiers.includes('shift')
        };
        this.registeredShortcuts.set(shortcutKey, shortcut);
    }

    unregister(shortcutKey: string) {
        this.registeredShortcuts.delete(shortcutKey);
    }

    private handleKeyPress = (event: KeyboardEvent) => {
        // Check registered shortcuts first
        for (const shortcut of Array.from(this.registeredShortcuts.values())) {
            if (
                shortcut.key.toLowerCase() === event.key.toLowerCase() &&
                !!shortcut.ctrlKey === event.ctrlKey &&
                !!shortcut.altKey === event.altKey &&
                !!shortcut.shiftKey === event.shiftKey
            ) {
                event.preventDefault();
                shortcut.action?.();
                return;
            }
        }

        // Then check predefined shortcuts
        const shortcut = KEYBOARD_SHORTCUTS.find(s =>
            s.key.toLowerCase() === event.key.toLowerCase() &&
            !!s.ctrlKey === event.ctrlKey &&
            !!s.altKey === event.altKey &&
            !!s.shiftKey === event.shiftKey
        );

        if (shortcut?.action) {
            event.preventDefault();
            shortcut.action();
        }
    };
}

export const keyboardShortcuts = new KeyboardShortcutsManager();