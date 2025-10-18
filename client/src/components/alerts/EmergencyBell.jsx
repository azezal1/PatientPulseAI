import { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';

/**
 * Emergency Bell component - floating notification bell with badge
 * Shows critical patient count and provides audio/visual alerts
 */
const EmergencyBell = ({ criticalCount = 0, onClick, className = '' }) => {
  const [isRinging, setIsRinging] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  
  // Trigger ringing animation when critical count increases
  useEffect(() => {
    if (criticalCount > 0) {
      setIsRinging(true);
      setHasNewAlert(true);
      
      // Stop ringing after 3 seconds
      const timer = setTimeout(() => {
        setIsRinging(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [criticalCount]);
  
  // Play audio alert for critical patients
  useEffect(() => {
    if (criticalCount > 0 && hasNewAlert) {
      try {
        // Create audio context for alert sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
        // Second beep
        setTimeout(() => {
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          
          oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
          gainNode2.gain.setValueAtTime(0.1, audioContext.currentTime);
          
          oscillator2.start();
          oscillator2.stop(audioContext.currentTime + 0.2);
        }, 300);
        
      } catch (error) {
        console.warn('Audio alert not available:', error);
      }
    }
  }, [criticalCount, hasNewAlert]);
  
  const handleClick = () => {
    setHasNewAlert(false);
    onClick && onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 ${
        criticalCount > 0 
          ? 'bg-red-600 hover:bg-red-700 text-white' 
          : 'bg-gray-600 hover:bg-gray-700 text-white'
      } ${isRinging ? 'animate-bounce' : ''} ${className}`}
      aria-label={`Emergency alerts: ${criticalCount} critical patients`}
      role="alert"
    >
      <div className="relative">
        {isRinging ? (
          <BellRing className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {/* Badge */}
        {criticalCount > 0 && (
          <span 
            className={`absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold rounded-full ${
              hasNewAlert ? 'bg-yellow-400 text-red-900 animate-pulse' : 'bg-red-100 text-red-900'
            }`}
            aria-label={`${criticalCount} critical alerts`}
          >
            {criticalCount > 99 ? '99+' : criticalCount}
          </span>
        )}
        
        {/* Pulse effect for new alerts */}
        {hasNewAlert && (
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
        )}
      </div>
    </button>
  );
};

export default EmergencyBell;
