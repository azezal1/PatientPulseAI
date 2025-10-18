import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to callbacks
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Build key combination string
      const keys = [];
      if (event.ctrlKey) keys.push('ctrl');
      if (event.altKey) keys.push('alt');
      if (event.shiftKey) keys.push('shift');
      keys.push(event.key.toLowerCase());
      
      const combination = keys.join('+');

      // Check if this combination has a handler
      if (shortcuts[combination]) {
        event.preventDefault();
        shortcuts[combination](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Predefined shortcuts for the app
export const APP_SHORTCUTS = {
  'ctrl+k': 'Search patients',
  'ctrl+n': 'New patient',
  'ctrl+d': 'Toggle dark mode',
  'ctrl+1': 'Navigate to Triage',
  'ctrl+2': 'Navigate to Patients',
  'ctrl+3': 'Navigate to Dashboard',
  'ctrl+shift+l': 'Toggle language',
  'escape': 'Close modal/dialog',
  'ctrl+s': 'Save/Submit form',
};
