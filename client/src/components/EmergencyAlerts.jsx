import { useState, useEffect } from 'react';
import { Bell, BellRing, X, AlertTriangle } from 'lucide-react';

const EmergencyAlerts = ({ patients }) => {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Filter critical patients added in last 5 minutes
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const criticalPatients = patients.filter(p => 
      p.urgency === 'Critical' && 
      new Date(p.timestamp) > fiveMinutesAgo
    );

    if (criticalPatients.length > alerts.length) {
      // New critical patient detected
      const newAlerts = criticalPatients.map(p => ({
        id: p.id,
        patient: p,
        read: false,
        timestamp: p.timestamp
      }));
      
      setAlerts(newAlerts);
      setUnreadCount(newAlerts.filter(a => !a.read).length);

      // Play alert sound (optional)
      if (newAlerts.length > 0) {
        playAlertSound();
      }
    }
  }, [patients]);

  const playAlertSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const markAsRead = (alertId) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, read: true } : a
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setUnreadCount(prev => Math.max(0, prev - (alerts.find(a => a.id === alertId)?.read ? 0 : 1)));
  };

  const clearAll = () => {
    setAlerts([]);
    setUnreadCount(0);
    setIsOpen(false);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      {/* Alert Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 animate-pulse"
        title="Emergency Alerts"
      >
        <BellRing className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Alert Panel */}
      {isOpen && (
        <div className="absolute top-14 right-0 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-red-500 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold">Emergency Alerts</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-red-700 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  alert.read
                    ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 animate-flash'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="font-bold text-red-900 dark:text-red-100">
                        CRITICAL PATIENT
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {alert.patient.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.patient.age} years, {alert.patient.gender}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Symptoms:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {alert.patient.symptoms.slice(0, 3).map((symptom, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">HR:</span>{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {alert.patient.vitals.heartRate} bpm
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">O2:</span>{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {alert.patient.vitals.oxygenSaturation}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-100 dark:bg-gray-900 p-3 border-t border-gray-300 dark:border-gray-700">
            <button
              onClick={clearAll}
              className="w-full text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold"
            >
              Clear All Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlerts;
