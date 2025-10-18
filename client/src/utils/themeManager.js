// Enhanced Theme Manager for PatientPulse AI v3.5+
export class ThemeManager {
  constructor() {
    this.theme = 'light';
    this.autoMode = false;
    this.systemPreference = 'light';
    this.timeBasedTheme = false;
    this.listeners = new Set();
    this.mediaQuery = null;
    
    this.init();
  }

  init() {
    // Load saved preferences
    this.loadPreferences();
    
    // Set up system theme detection
    this.setupSystemThemeDetection();
    
    // Set up time-based theme switching
    this.setupTimeBasedTheme();
    
    // Apply initial theme
    this.applyTheme();
  }

  loadPreferences() {
    try {
      const savedTheme = localStorage.getItem('patientpulse-theme');
      const savedAutoMode = localStorage.getItem('patientpulse-auto-theme') === 'true';
      const savedTimeBasedTheme = localStorage.getItem('patientpulse-time-theme') === 'true';
      
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        this.theme = savedTheme;
      }
      
      this.autoMode = savedAutoMode;
      this.timeBasedTheme = savedTimeBasedTheme;
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }

  savePreferences() {
    try {
      localStorage.setItem('patientpulse-theme', this.theme);
      localStorage.setItem('patientpulse-auto-theme', this.autoMode.toString());
      localStorage.setItem('patientpulse-time-theme', this.timeBasedTheme.toString());
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }

  setupSystemThemeDetection() {
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPreference = this.mediaQuery.matches ? 'dark' : 'light';
      
      // Listen for system theme changes
      this.mediaQuery.addEventListener('change', (e) => {
        this.systemPreference = e.matches ? 'dark' : 'light';
        if (this.autoMode) {
          this.applyTheme();
          this.notifyListeners();
        }
      });
    }
  }

  setupTimeBasedTheme() {
    // Update theme based on time every minute
    setInterval(() => {
      if (this.timeBasedTheme) {
        const newTheme = this.getTimeBasedTheme();
        if (newTheme !== this.getCurrentTheme()) {
          this.applyTheme();
          this.notifyListeners();
        }
      }
    }, 60000); // Check every minute
  }

  getTimeBasedTheme() {
    const hour = new Date().getHours();
    
    // Dark theme from 7 PM to 7 AM (19:00 to 07:00)
    if (hour >= 19 || hour < 7) {
      return 'dark';
    }
    
    return 'light';
  }

  getCurrentTheme() {
    if (this.timeBasedTheme) {
      return this.getTimeBasedTheme();
    }
    
    if (this.autoMode) {
      return this.systemPreference;
    }
    
    return this.theme;
  }

  setTheme(theme) {
    if (!['light', 'dark', 'auto'].includes(theme)) {
      console.warn('Invalid theme:', theme);
      return;
    }
    
    this.theme = theme;
    this.autoMode = theme === 'auto';
    this.savePreferences();
    this.applyTheme();
    this.notifyListeners();
  }

  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setAutoMode(enabled) {
    this.autoMode = enabled;
    if (enabled) {
      this.theme = 'auto';
    }
    this.savePreferences();
    this.applyTheme();
    this.notifyListeners();
  }

  setTimeBasedTheme(enabled) {
    this.timeBasedTheme = enabled;
    this.savePreferences();
    this.applyTheme();
    this.notifyListeners();
  }

  applyTheme() {
    const effectiveTheme = this.getCurrentTheme();
    const isDark = effectiveTheme === 'dark';
    
    // Apply to document
    document.documentElement.classList.toggle('dark', isDark);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(isDark);
    
    // Apply custom CSS properties
    this.applyCustomProperties(isDark);
  }

  updateMetaThemeColor(isDark) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.content = isDark ? '#1f2937' : '#3b82f6';
  }

  applyCustomProperties(isDark) {
    const root = document.documentElement;
    
    if (isDark) {
      // Dark theme custom properties
      root.style.setProperty('--glass-bg', 'rgba(17, 25, 40, 0.75)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.125)');
      root.style.setProperty('--glass-shadow', '0 8px 32px 0 rgba(31, 38, 135, 0.37)');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#d1d5db');
    } else {
      // Light theme custom properties
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.25)');
      root.style.setProperty('--glass-border', 'rgba(209, 213, 219, 0.3)');
      root.style.setProperty('--glass-shadow', '0 8px 32px 0 rgba(31, 38, 135, 0.37)');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6b7280');
    }
  }

  // Event listener management
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    const themeData = {
      theme: this.getCurrentTheme(),
      autoMode: this.autoMode,
      timeBasedTheme: this.timeBasedTheme,
      systemPreference: this.systemPreference
    };
    
    this.listeners.forEach(callback => {
      try {
        callback(themeData);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  // Utility methods
  isDark() {
    return this.getCurrentTheme() === 'dark';
  }

  isLight() {
    return this.getCurrentTheme() === 'light';
  }

  getThemeInfo() {
    return {
      current: this.getCurrentTheme(),
      saved: this.theme,
      autoMode: this.autoMode,
      timeBasedTheme: this.timeBasedTheme,
      systemPreference: this.systemPreference,
      timeBasedRecommendation: this.getTimeBasedTheme()
    };
  }

  // Accessibility helpers
  getContrastRatio(color1, color2) {
    // Simplified contrast ratio calculation
    const getLuminance = (color) => {
      const rgb = parseInt(color.replace('#', ''), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  ensureAccessibility() {
    const isDark = this.isDark();
    const backgroundColor = isDark ? '#111827' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#111827';
    
    const contrast = this.getContrastRatio(backgroundColor, textColor);
    
    if (contrast < 4.5) {
      console.warn('Low contrast ratio detected:', contrast);
      // Could automatically adjust colors here
    }
    
    return contrast >= 4.5;
  }
}

// Create singleton instance
export const themeManager = new ThemeManager();

// Helper function to create useTheme hook (to be used in React components)
export const createUseTheme = (useState, useEffect) => {
  return () => {
    const [themeState, setThemeState] = useState(() => themeManager.getThemeInfo());
    
    useEffect(() => {
      const unsubscribe = themeManager.addListener(setThemeState);
      return unsubscribe;
    }, []);
    
    return {
      ...themeState,
      setTheme: themeManager.setTheme.bind(themeManager),
      toggleTheme: themeManager.toggleTheme.bind(themeManager),
      setAutoMode: themeManager.setAutoMode.bind(themeManager),
      setTimeBasedTheme: themeManager.setTimeBasedTheme.bind(themeManager),
      isDark: themeManager.isDark.bind(themeManager),
      isLight: themeManager.isLight.bind(themeManager)
    };
  };
};

// Theme transition animations
const TRANSITION_DURATION = 300;
const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export const themeTransitions = {
  duration: TRANSITION_DURATION,
  easing: TRANSITION_EASING,
  
  // CSS transition for smooth theme changes
  getCSSTransition: () => `
    * {
      transition: background-color ${TRANSITION_DURATION}ms ${TRANSITION_EASING},
                  border-color ${TRANSITION_DURATION}ms ${TRANSITION_EASING},
                  color ${TRANSITION_DURATION}ms ${TRANSITION_EASING},
                  box-shadow ${TRANSITION_DURATION}ms ${TRANSITION_EASING};
    }
  `,
  
  // Framer Motion variants
  variants: {
    light: {
      backgroundColor: '#ffffff',
      color: '#111827',
      transition: { duration: TRANSITION_DURATION / 1000 }
    },
    dark: {
      backgroundColor: '#111827',
      color: '#ffffff',
      transition: { duration: TRANSITION_DURATION / 1000 }
    }
  }
};

// Export for global access
if (typeof window !== 'undefined') {
  window.themeManager = themeManager;
}
