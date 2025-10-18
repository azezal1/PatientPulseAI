import { useState, useEffect, Suspense } from 'react';
import { 
  Activity, Users, LayoutDashboard, Languages, Moon, Sun, Plus, Search, 
  Filter, AlertTriangle, Heart, Thermometer, Droplets, Brain, Mic, 
  Settings, Wifi, WifiOff, Database, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import { format } from 'date-fns';

// Enhanced v3.5+ components
import MultiStepForm from './components/MultiStepForm';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import AIInsightsModal from './components/AIInsightsModal';
import GlassmorphismDashboard from './components/GlassmorphismDashboard';
import VoiceInput from './components/VoiceInput';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineMode from './components/OfflineMode';

// Enhanced utilities
import { translations, getTranslation, supportedLanguages } from './utils/translations';
import { enhancedAI, conversationalAI } from './utils/enhancedAI';
import { themeManager } from './utils/themeManager';

const API_BASE = 'http://localhost:3001/api';

function App() {
  // Enhanced state management for v3.5+
  const [activeTab, setActiveTab] = useState('triage');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // New v3.5+ state
  const [isAIInitialized, setIsAIInitialized] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userRole, setUserRole] = useState('demo');
  const [isGlassmorphismMode, setIsGlassmorphismMode] = useState(true);
  const [autoThemeEnabled, setAutoThemeEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Offline mode integration
  const offlineMode = OfflineMode({ 
    language, 
    theme, 
    onDataSync: (result) => {
      toast.success(`Synced ${result.success} items successfully`);
      setRefreshTrigger(prev => prev + 1);
    }
  });

  const t = (key) => getTranslation(language, key);

  // Enhanced initialization for v3.5+
  useEffect(() => {
    const initializeApp = async () => {
      // Load saved preferences
      const savedTheme = localStorage.getItem('patientpulse-theme') || 'light';
      const savedLanguage = localStorage.getItem('patientpulse-language') || 'en';
      const savedAutoTheme = localStorage.getItem('patientpulse-auto-theme') === 'true';
      const savedVoiceEnabled = localStorage.getItem('patientpulse-voice') !== 'false';
      const savedGlassmorphism = localStorage.getItem('patientpulse-glassmorphism') !== 'false';
      
      setTheme(savedTheme);
      setLanguage(savedLanguage);
      setAutoThemeEnabled(savedAutoTheme);
      setVoiceEnabled(savedVoiceEnabled);
      setIsGlassmorphismMode(savedGlassmorphism);
      
      // Initialize theme manager
      themeManager.setTheme(savedTheme);
      themeManager.setAutoMode(savedAutoTheme);
      
      // Initialize enhanced AI
      try {
        await enhancedAI.initialize();
        setIsAIInitialized(true);
        toast.success('AI system initialized', { icon: '🧠' });
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        toast.error('AI initialization failed - using fallback mode');
      }
    };

    initializeApp();
  }, []);

  // Theme change listener
  useEffect(() => {
    const unsubscribe = themeManager.addListener((themeData) => {
      setTheme(themeData.theme);
      setAutoThemeEnabled(themeData.autoMode);
    });

    return unsubscribe;
  }, []);

  // Fetch data with enhanced error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchPatients(), fetchStats()]);
      } catch (error) {
        console.error('Data fetch error:', error);
        if (!offlineMode.isOnline) {
          toast.error('Offline mode - using cached data');
        }
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_BASE}/patients`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      if (offlineMode.isOnline) {
        toast.error('Failed to fetch patients');
      }
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Enhanced theme management
  const toggleTheme = () => {
    if (autoThemeEnabled) {
      themeManager.setAutoMode(false);
    } else {
      themeManager.toggleTheme();
    }
  };

  const setAutoTheme = (enabled) => {
    setAutoThemeEnabled(enabled);
    themeManager.setAutoMode(enabled);
    localStorage.setItem('patientpulse-auto-theme', enabled.toString());
  };

  // Enhanced language switching with 4 languages
  const toggleLanguage = () => {
    const languages = ['en', 'hi', 'ta', 'mr'];
    const currentIndex = languages.indexOf(language);
    const nextLanguage = languages[(currentIndex + 1) % languages.length];
    setLanguage(nextLanguage);
    localStorage.setItem('patientpulse-language', nextLanguage);
  };

  const setLanguageDirectly = (lang) => {
    setLanguage(lang);
    localStorage.setItem('patientpulse-language', lang);
  };

  // Enhanced patient handling with offline support
  const handlePatientAdded = async (patientData) => {
    if (!offlineMode.isOnline) {
      // Save offline
      const offlineId = offlineMode.saveOfflineData({
        type: 'patient',
        ...patientData
      });
      if (offlineId) {
        toast.success('Patient saved offline - will sync when online');
      }
    } else {
      setRefreshTrigger(prev => prev + 1);
      toast.success('Patient added successfully!');
    }
  };

  const handlePredictionView = (prediction) => {
    setSelectedPrediction(prediction);
    setShowAIInsights(true);
  };

  // Voice command handling
  const handleVoiceCommand = (command) => {
    switch (command) {
      case 'next_step':
        // Handle next step in form
        toast.success('Moving to next step');
        break;
      case 'previous_step':
        // Handle previous step in form
        toast.success('Moving to previous step');
        break;
      case 'clear_symptoms':
        // Clear symptoms
        toast.success('Symptoms cleared');
        break;
      case 'submit_form':
        // Submit form
        toast.success('Submitting form');
        break;
      case 'show_dashboard':
        setActiveTab('dashboard');
        toast.success('Switching to dashboard');
        break;
      case 'emergency_alert':
        toast.error('Emergency alert activated!', { 
          duration: 10000,
          icon: '🚨'
        });
        break;
      case 'show_help':
        toast('Voice commands: "next step", "previous step", "clear symptoms", "submit form", "show dashboard", "emergency"', {
          duration: 8000,
          icon: '💡'
        });
        break;
      default:
        console.log('Unknown voice command:', command);
    }
  };

  // Voice transcript handling
  const handleVoiceTranscript = (transcript) => {
    console.log('Voice transcript:', transcript);
    // Could be used to fill form fields automatically
  };

  // Settings management
  const handleSettingsChange = (setting, value) => {
    switch (setting) {
      case 'glassmorphism':
        setIsGlassmorphismMode(value);
        localStorage.setItem('patientpulse-glassmorphism', value.toString());
        break;
      case 'voice':
        setVoiceEnabled(value);
        localStorage.setItem('patientpulse-voice', value.toString());
        break;
      case 'autoTheme':
        setAutoTheme(value);
        break;
      default:
        console.log('Unknown setting:', setting, value);
    }
  };

  return (
    <ErrorBoundary language={language} theme={theme}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Enhanced Toaster with better styling */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-gray-800 dark:text-white',
            style: {
              background: theme === 'dark' ? 'rgba(17, 25, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.125)' : '1px solid rgba(209, 213, 219, 0.3)'
            }
          }}
        />

        {/* Offline Banner */}
        <offlineMode.components.OfflineBanner />

        {/* Enhanced Header with glassmorphism */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="relative overflow-hidden"
          style={{
            background: isGlassmorphismMode 
              ? 'rgba(59, 130, 246, 0.9)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            backdropFilter: isGlassmorphismMode ? 'blur(16px) saturate(180%)' : 'none',
            WebkitBackdropFilter: isGlassmorphismMode ? 'blur(16px) saturate(180%)' : 'none'
          }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="container mx-auto px-4 py-6 relative z-10">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Activity className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{t('appTitle')}</h1>
                  <p className="text-blue-100 text-sm">
                    AI-Powered Medical Triage System v3.5+
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Connection Status */}
                <offlineMode.components.ConnectionStatus />

                {/* Voice Input Toggle */}
                {voiceEnabled && (
                  <motion.button
                    onClick={() => setShowVoiceInput(!showVoiceInput)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                      showVoiceInput 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic className="w-5 h-5" />
                  </motion.button>
                )}

                {/* AI Status */}
                <motion.div
                  className={`p-2 rounded-lg ${
                    isAIInitialized 
                      ? 'bg-green-500/20 text-green-100' 
                      : 'bg-yellow-500/20 text-yellow-100'
                  }`}
                  animate={{ 
                    scale: isAIInitialized ? [1, 1.05, 1] : 1,
                    opacity: isAIInitialized ? [1, 0.8, 1] : 0.7
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="w-5 h-5" />
                </motion.div>

                {/* Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={autoThemeEnabled ? 'Auto Theme' : (theme === 'light' ? t('darkMode') : t('lightMode'))}
                >
                  {autoThemeEnabled ? (
                    <Settings className="w-5 h-5" />
                  ) : theme === 'light' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </motion.button>

                {/* Language Selector */}
                <div className="relative">
                  <motion.button
                    onClick={toggleLanguage}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={t('switchLanguage')}
                  >
                    <Languages className="w-5 h-5" />
                    <span className="font-semibold">
                      {language === 'en' ? 'EN' : 
                       language === 'hi' ? 'हिं' : 
                       language === 'ta' ? 'த' : 'मर'}
                    </span>
                  </motion.button>
                </div>

                {/* Settings */}
                <motion.button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Voice Input Panel */}
        <AnimatePresence>
          {showVoiceInput && voiceEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4"
            >
              <VoiceInput
                language={language}
                onTranscript={handleVoiceTranscript}
                onCommand={handleVoiceCommand}
                placeholder={t('speakSymptoms')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Navigation Tabs */}
        <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              {[
                { id: 'triage', icon: Activity, label: t('tabs.triage') },
                { id: 'patients', icon: Users, label: t('tabs.patients') },
                { id: 'dashboard', icon: LayoutDashboard, label: t('tabs.dashboard') },
                { id: 'assistant', icon: Brain, label: t('tabs.assistant') }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            {/* Smart Triage Tab */}
            {activeTab === 'triage' && (
              <motion.div
                key="triage"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="container mx-auto px-4 py-8"
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                }>
                  <MultiStepForm
                    language={language}
                    onPatientAdded={handlePatientAdded}
                    onPredictionView={handlePredictionView}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* Patient Hub Tab */}
            {activeTab === 'patients' && (
              <motion.div
                key="patients"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="container mx-auto px-4 py-8"
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                }>
                  <PatientList
                    patients={patients}
                    language={language}
                    onPredictionView={handlePredictionView}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* Enhanced Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full"
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                }>
                  {isGlassmorphismMode ? (
                    <GlassmorphismDashboard
                      language={language}
                      theme={theme}
                      patients={patients}
                      stats={stats}
                      onVoiceCommand={handleVoiceCommand}
                    />
                  ) : (
                    <Dashboard
                      patients={patients}
                      stats={stats}
                      language={language}
                    />
                  )}
                </Suspense>
              </motion.div>
            )}

            {/* AI Assistant Tab */}
            {activeTab === 'assistant' && (
              <motion.div
                key="assistant"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="container mx-auto px-4 py-8"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="inline-block mb-4"
                    >
                      <Brain className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('aiAssistant')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Conversational AI for medical triage assistance
                    </p>
                  </div>

                  {voiceEnabled && (
                    <div className="mb-8">
                      <VoiceInput
                        language={language}
                        onTranscript={handleVoiceTranscript}
                        onCommand={handleVoiceCommand}
                        placeholder={t('askQuestion')}
                      />
                    </div>
                  )}

                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      AI Capabilities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Symptom Analysis
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Analyze patient symptoms and provide triage recommendations
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                          Vital Signs Interpretation
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Interpret vital signs and identify potential concerns
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                          Medical Recommendations
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Provide evidence-based medical recommendations
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                          Risk Assessment
                        </h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Assess patient risk levels and urgency
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* AI Insights Modal */}
        <AnimatePresence>
          {showAIInsights && selectedPrediction && (
            <AIInsightsModal
              prediction={selectedPrediction}
              language={language}
              onClose={() => setShowAIInsights(false)}
            />
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-md w-full rounded-xl p-6"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(17, 25, 40, 0.95)' 
                    : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: theme === 'dark' 
                    ? '1px solid rgba(255, 255, 255, 0.125)' 
                    : '1px solid rgba(209, 213, 219, 0.3)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Settings
                  </h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Theme
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={autoThemeEnabled}
                          onChange={(e) => handleSettingsChange('autoTheme', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Auto theme switching
                        </span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isGlassmorphismMode}
                          onChange={(e) => handleSettingsChange('glassmorphism', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Glassmorphism UI
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Voice Settings */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Voice & Audio
                    </h3>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={voiceEnabled}
                        onChange={(e) => handleSettingsChange('voice', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Enable voice input
                      </span>
                    </label>
                  </div>

                  {/* Language Settings */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Language
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {supportedLanguages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguageDirectly(lang.code)}
                          className={`p-2 rounded-lg text-sm transition-colors ${
                            language === lang.code
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {lang.nativeName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Offline Settings */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Offline Mode
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Pending operations: {offlineMode.pendingOperations}
                      </span>
                      <button
                        onClick={offlineMode.syncOfflineData}
                        disabled={!offlineMode.isOnline}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sync Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Status */}
        <div className="fixed bottom-4 right-4 z-40">
          <offlineMode.components.SyncStatus />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
