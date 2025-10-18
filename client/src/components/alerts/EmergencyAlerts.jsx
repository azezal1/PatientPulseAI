import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import EmergencyBell from './EmergencyBell';
import AlertToast from './AlertToast';

/**
 * Enhanced Emergency Alerts system with improved UX and accessibility
 * Manages critical patient notifications with audio/visual alerts
 */
const EmergencyAlerts = ({ patients = [] }) => {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Filter critical patients added in last 10 minutes
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    const criticalPatients = patients.filter(p => 
      p.urgency === 'Critical' && 
      new Date(p.timestamp || now) > tenMinutesAgo
    );

    // Check for new critical patients
    const existingIds = new Set(alerts.map(a => a.id));
    const newCriticalPatients = criticalPatients.filter(p => !existingIds.has(p.id));

    if (newCriticalPatients.length > 0) {
      // Add new alerts
      const newAlerts = newCriticalPatients.map(p => ({
        id: p.id,
        patient: p,
        read: false,
        timestamp: p.timestamp || new Date().toISOString()
      }));
      
      setAlerts(prev => [...newAlerts, ...prev]);
      setUnreadCount(prev => prev + newAlerts.length);

      // Show toast notifications for new critical patients
      newCriticalPatients.forEach((patient, index) => {
        setTimeout(() => {
          showToast({
            type: 'error',
            title: 'CRITICAL PATIENT ALERT',
            message: `${patient.name} requires immediate attention`,
            duration: 8000
          });
        }, index * 1000); // Stagger toasts
      });
    }

    // Remove old alerts (older than 10 minutes)
    setAlerts(prev => prev.filter(alert => 
      new Date(alert.timestamp) > tenMinutesAgo
    ));
  }, [patients]);

  const showToast = (toastData) => {
    const id = Date.now() + Math.random();
    const toast = { ...toastData, id };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = (alertId) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, read: true } : a
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismissAlert = (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    if (alert && !alert.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAll = () => {
    setAlerts([]);
    setUnreadCount(0);
    setIsOpen(false);
  };

  const criticalCount = alerts.filter(a => !a.read).length;

  return (
    <>
      {/* Emergency Bell */}
      <EmergencyBell 
        criticalCount={criticalCount}
        onClick={() => setIsOpen(!isOpen)}
      />

      {/* Alert Panel */}
      {isOpen && alerts.length > 0 && (
        <div className="fixed bottom-20 right-6 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-red-500 max-h-[500px] overflow-hidden flex flex-col z-40">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold">Emergency Alerts</h3>
              <span className="bg-red-800 text-xs px-2 py-1 rounded-full">
                {alerts.length}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-red-700 p-1 rounded transition-colors"
              aria-label="Close alerts panel"
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
                    : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 animate-pulse'
                }`}
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="font-bold text-red-900 dark:text-red-100 text-sm">
                        CRITICAL PATIENT
                      </span>
                      {!alert.read && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
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
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Symptoms */}
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Symptoms:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(alert.patient.symptoms || []).slice(0, 3).map((symptom, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">HR:</span>{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {alert.patient.vitals?.heartRate || 'N/A'} bpm
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">O2:</span>{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {alert.patient.vitals?.oxygenSaturation || 'N/A'}%
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="bg-gray-100 dark:bg-gray-900 p-3 border-t border-gray-300 dark:border-gray-700">
              <button
                onClick={clearAll}
                className="w-full text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
              >
                Clear All Alerts ({alerts.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <AlertToast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
};

export default EmergencyAlerts;
