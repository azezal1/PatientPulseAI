import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, Wifi, CloudOff, Cloud, RefreshCw, 
  Database, Save, Upload, AlertCircle, CheckCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTranslation } from '../utils/translations';

const OfflineMode = ({ language = 'en', theme = 'light', onDataSync }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSync, setLastSync] = useState(null);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);

  const t = (key) => getTranslation(language, key);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      toast.success('Connection restored! Syncing data...', {
        icon: '🌐',
        duration: 3000
      });
      
      // Auto-sync when coming back online
      if (offlineData.length > 0) {
        syncOfflineData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      toast.error('You are now offline. Data will be saved locally.', {
        icon: '📱',
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data from localStorage
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline data from localStorage
  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('patientpulse_offline_data');
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineData(data);
        setPendingOperations(data.length);
      }

      const lastSyncTime = localStorage.getItem('patientpulse_last_sync');
      if (lastSyncTime) {
        setLastSync(new Date(lastSyncTime));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  // Save data offline
  const saveOfflineData = (data) => {
    try {
      const offlineEntry = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data,
        timestamp: new Date().toISOString(),
        type: data.type || 'patient',
        synced: false
      };

      const updatedOfflineData = [...offlineData, offlineEntry];
      setOfflineData(updatedOfflineData);
      setPendingOperations(updatedOfflineData.length);
      
      localStorage.setItem('patientpulse_offline_data', JSON.stringify(updatedOfflineData));
      
      toast.success('Data saved offline', {
        icon: '💾',
        duration: 2000
      });

      return offlineEntry.id;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      toast.error('Failed to save data offline');
      return null;
    }
  };

  // Sync offline data when online
  const syncOfflineData = async () => {
    if (!isOnline || offlineData.length === 0) return;

    setSyncStatus('syncing');
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const entry of offlineData) {
        if (entry.synced) continue;

        try {
          // Simulate API call to sync data
          await syncSingleEntry(entry);
          entry.synced = true;
          successCount++;
        } catch (error) {
          console.error('Failed to sync entry:', entry.id, error);
          errorCount++;
        }
      }

      // Update offline data
      const syncedData = offlineData.filter(entry => !entry.synced);
      setOfflineData(syncedData);
      setPendingOperations(syncedData.length);
      localStorage.setItem('patientpulse_offline_data', JSON.stringify(syncedData));

      // Update last sync time
      const now = new Date();
      setLastSync(now);
      localStorage.setItem('patientpulse_last_sync', now.toISOString());

      if (errorCount === 0) {
        setSyncStatus('success');
        toast.success(`Successfully synced ${successCount} items`, {
          icon: '✅',
          duration: 3000
        });
      } else {
        setSyncStatus('error');
        toast.error(`Synced ${successCount} items, ${errorCount} failed`, {
          icon: '⚠️',
          duration: 4000
        });
      }

      // Notify parent component
      if (onDataSync) {
        onDataSync({
          success: successCount,
          errors: errorCount,
          total: successCount + errorCount
        });
      }

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      toast.error('Sync failed. Will retry automatically.');
    }

    // Reset status after 3 seconds
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  // Simulate syncing a single entry
  const syncSingleEntry = async (entry) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }

    // In a real app, this would make an actual API call
    console.log('Syncing entry:', entry);
    return { success: true, id: entry.id };
  };

  // Clear offline data
  const clearOfflineData = () => {
    setOfflineData([]);
    setPendingOperations(0);
    localStorage.removeItem('patientpulse_offline_data');
    toast.success('Offline data cleared');
  };

  // Manual sync trigger
  const handleManualSync = () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }
    syncOfflineData();
  };

  // Connection status indicator
  const ConnectionStatus = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
        isOnline
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </>
      )}
    </motion.div>
  );

  // Offline banner
  const OfflineBanner = () => (
    <AnimatePresence>
      {showOfflineBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-3"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <CloudOff className="w-5 h-5" />
              <span className="font-medium">
                You're offline. Changes will be saved locally and synced when connection is restored.
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {pendingOperations > 0 && (
                <span className="text-sm">
                  {pendingOperations} pending operations
                </span>
              )}
              
              <button
                onClick={() => setShowOfflineBanner(false)}
                className="text-yellow-900 hover:text-yellow-800"
              >
                ×
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Sync status indicator
  const SyncStatus = () => {
    if (syncStatus === 'idle' && pendingOperations === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
          theme === 'dark' 
            ? 'bg-gray-800 text-gray-300' 
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {syncStatus === 'syncing' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            <span>Syncing...</span>
          </>
        )}
        
        {syncStatus === 'success' && (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Sync complete</span>
          </>
        )}
        
        {syncStatus === 'error' && (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>Sync failed</span>
          </>
        )}
        
        {syncStatus === 'idle' && pendingOperations > 0 && (
          <>
            <Database className="w-4 h-4" />
            <span>{pendingOperations} pending</span>
          </>
        )}
      </motion.div>
    );
  };

  // Offline data manager panel
  const OfflineDataPanel = ({ isOpen, onClose }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{
              background: theme === 'dark' 
                ? 'rgba(17, 25, 40, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Offline Data Manager
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <ConnectionStatus />
                <SyncStatus />
              </div>

              {/* Last sync */}
              {lastSync && (
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Last sync: {lastSync.toLocaleString()}
                </p>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleManualSync}
                  disabled={!isOnline || syncStatus === 'syncing'}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  <span>Sync Now</span>
                </button>

                <button
                  onClick={clearOfflineData}
                  disabled={offlineData.length === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear Data</span>
                </button>
              </div>

              {/* Offline data list */}
              {offlineData.length > 0 && (
                <div>
                  <h3 className={`font-medium mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Pending Operations ({offlineData.length})
                  </h3>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {offlineData.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {entry.data.name || entry.data.type || 'Unknown'}
                            </p>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className={`px-2 py-1 rounded text-xs ${
                            entry.synced
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {entry.synced ? 'Synced' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return {
    isOnline,
    offlineData,
    pendingOperations,
    syncStatus,
    lastSync,
    saveOfflineData,
    syncOfflineData: handleManualSync,
    clearOfflineData,
    components: {
      ConnectionStatus,
      OfflineBanner,
      SyncStatus,
      OfflineDataPanel
    }
  };
};

export default OfflineMode;
