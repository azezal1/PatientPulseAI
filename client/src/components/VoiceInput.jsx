import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getTranslation } from '../utils/translations';

const VoiceInput = ({ 
  language = 'en', 
  onTranscript, 
  onCommand,
  isActive = false,
  placeholder = "Speak your symptoms or medical concerns..."
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState(0);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const isDestroyedRef = useRef(false);

  const t = (key) => getTranslation(language, key);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      setupSpeechRecognition();
    }

    return () => {
      // Set destroyed flag to prevent any further operations
      isDestroyedRef.current = true;
      setIsDestroyed(true);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
          recognitionRef.current.stop();
          recognitionRef.current = null;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [language]);

  const setupSpeechRecognition = () => {
    const recognition = recognitionRef.current;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    // Set language based on prop
    const languageMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'mr': 'mr-IN'
    };
    recognition.lang = languageMap[language] || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setupAudioVisualization();
      toast.success(t('listening'));
    };

    recognition.onend = () => {
      setIsListening(false);
      setAudioLevel(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Prevent automatic restart if we're in network error state
      if (isNetworkError) {
        return;
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcriptText;
          setConfidence(Math.round(result[0].confidence * 100));
        } else {
          interimTranscript += transcriptText;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        onTranscript?.(finalTranscript);
        
        // Check for voice commands
        checkForCommands(finalTranscript);
      }
      
      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event) => {
      // If component is destroyed, don't process errors
      if (isDestroyedRef.current) {
        return;
      }
      
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      const now = Date.now();
      const timeSinceLastError = now - lastErrorTime;
      
      // For network errors, immediately destroy and prevent further errors
      if (event.error === 'network') {
        setIsDestroyed(true);
        isDestroyedRef.current = true;
        
        // Force stop everything immediately
        try {
          if (recognitionRef.current) {
            recognitionRef.current.onstart = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onresult = null;
            recognitionRef.current.abort();
            recognitionRef.current.stop();
            recognitionRef.current = null;
          }
        } catch (e) {
          // Ignore cleanup errors
        }
        
        // Show error only once
        if (!isNetworkError) {
          setIsNetworkError(true);
          toast.error('Voice input disabled due to network issues. Please refresh the page to retry.', {
            duration: 8000,
            icon: '🌐'
          });
        }
        return;
      }
      
      // Prevent spam errors (only show error if it's been more than 5 seconds since last error)
      if (timeSinceLastError < 5000) {
        setErrorCount(prev => prev + 1);
        // If we've had more than 3 errors in quick succession, disable for a while
        if (errorCount >= 3) {
          setIsNetworkError(true);
          // Clear the network error flag after 30 seconds
          setTimeout(() => {
            if (!isDestroyedRef.current) {
              setIsNetworkError(false);
              setErrorCount(0);
            }
          }, 30000);
          return;
        }
      } else {
        setErrorCount(1);
      }
      
      setLastErrorTime(now);
      
      const errorMessages = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not accessible. Please check permissions.',
        'not-allowed': 'Microphone access denied. Please allow microphone access.',
        'network': 'Network error. Speech recognition requires internet connection.',
        'service-not-allowed': 'Speech recognition service not available.',
        'aborted': 'Speech recognition was aborted.',
        'language-not-supported': 'Language not supported for speech recognition.'
      };
      
      // Handle network errors specially
      if (event.error === 'network') {
        setIsNetworkError(true);
        
        // Immediately force stop all recognition to prevent restart
        forceStopRecognition();
        
        // Only show toast for first network error to avoid spam
        if (errorCount <= 1) {
          toast.error('Speech recognition requires internet connection. Voice input temporarily disabled.', {
            duration: 6000,
            icon: '🌐'
          });
        }
        
        // Clear network error after 15 seconds to allow retry
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          setIsNetworkError(false);
          setErrorCount(0);
          
          // Recreate the recognition instance to ensure clean state
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            setupSpeechRecognition();
          }
        }, 15000);
      } else {
        // For non-network errors, show toast normally
        toast.error(errorMessages[event.error] || `Speech recognition error: ${event.error}`, {
          duration: 4000
        });
      }
      
      // Reset audio level on error
      setAudioLevel(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  };

  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(Math.min(average / 128, 1));
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Audio visualization setup failed:', error);
    }
  };

  const checkForCommands = (text) => {
    const lowerText = text.toLowerCase();
    
    // Medical commands
    const commands = {
      'clear symptoms': () => onCommand?.('clear_symptoms'),
      'next step': () => onCommand?.('next_step'),
      'previous step': () => onCommand?.('previous_step'),
      'submit form': () => onCommand?.('submit_form'),
      'show dashboard': () => onCommand?.('show_dashboard'),
      'emergency': () => onCommand?.('emergency_alert'),
      'help': () => onCommand?.('show_help')
    };

    Object.entries(commands).forEach(([command, action]) => {
      if (lowerText.includes(command)) {
        action();
        toast.success(`Command executed: ${command}`);
      }
    });
  };

  const startListening = () => {
    // Check if component is destroyed
    if (isDestroyedRef.current || isDestroyed) {
      toast.error('Voice input has been disabled. Please refresh the page to retry.', {
        duration: 5000,
        icon: '🔄'
      });
      return;
    }

    if (!isSupported) {
      toast.error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.', {
        duration: 5000,
        icon: '🌐'
      });
      return;
    }

    // Check if we're in a network error state
    if (isNetworkError) {
      toast.error('Voice input disabled due to network issues. Please refresh the page to retry.', {
        duration: 5000,
        icon: '🔄'
      });
      return;
    }

    // Check network connectivity
    if (!navigator.onLine) {
      toast.error('Speech recognition requires internet connection. Please check your network.', {
        duration: 5000,
        icon: '📡'
      });
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        
        if (error.name === 'InvalidStateError') {
          toast.error('Speech recognition is already running. Please wait and try again.');
        } else if (error.name === 'NotAllowedError') {
          toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
        } else {
          toast.error('Failed to start voice input. Please try again.');
        }
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
    }
    setIsListening(false);
    setAudioLevel(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Force stop all recognition activities
  const forceStopRecognition = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } catch (error) {
      console.log('Error force stopping recognition:', error);
    }
    
    setIsListening(false);
    setAudioLevel(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language for speech synthesis
      const voiceMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'mr': 'mr-IN'
      };
      utterance.lang = voiceMap[language] || 'en-US';
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Voice Input Interface */}
      <div className="relative">
        <div className="flex items-center space-x-4 p-4 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/20">
          {/* Microphone Button */}
          <motion.button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported || isNetworkError}
            className={`relative p-4 rounded-full ${
              isNetworkError
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : isListening 
                  ? 'bg-red-500 text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={!isNetworkError ? { scale: 1.05 } : {}}
            whileTap={!isNetworkError ? { scale: 0.95 } : {}}
          >
            {isNetworkError ? (
              <div className="relative">
                <MicOff className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
            ) : isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
            
            {/* Audio level visualization */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/30"
                animate={{
                  scale: [1, 1 + audioLevel * 0.5],
                  opacity: [0.7, 0.3]
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            )}
          </motion.button>

          {/* Transcript Display */}
          <div className="flex-1 min-h-[60px] p-3 bg-white/5 dark:bg-gray-900/5 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {isListening ? t('listening') : placeholder}
            </div>
            
            <div className="text-gray-900 dark:text-white">
              {transcript && (
                <span className="font-medium">{transcript}</span>
              )}
              {interimTranscript && (
                <span className="text-gray-500 dark:text-gray-400 italic">
                  {interimTranscript}
                </span>
              )}
            </div>
            
            {confidence > 0 && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Confidence: {confidence}%
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {transcript && (
              <>
                <motion.button
                  onClick={() => speakText(transcript)}
                  disabled={isSpeaking}
                  className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </motion.button>
                
                <motion.button
                  onClick={clearTranscript}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Voice Commands Help */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Voice Commands Available:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
                <div>"Next step" - Go to next form step</div>
                <div>"Previous step" - Go to previous step</div>
                <div>"Clear symptoms" - Clear symptom list</div>
                <div>"Submit form" - Submit the form</div>
                <div>"Emergency" - Trigger emergency alert</div>
                <div>"Help" - Show help information</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browser Support Warning */}
        {!isSupported && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Voice input is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.
            </p>
          </motion.div>
        )}

        {/* Network Status Warning */}
        {isSupported && !navigator.onLine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-red-800 dark:text-red-200">
                No internet connection. Voice recognition requires an active internet connection to work.
              </p>
            </div>
          </motion.div>
        )}

        {/* Helpful Tips */}
        {isSupported && navigator.onLine && !isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Voice Input Tips:
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Ensure you have a stable internet connection</li>
              <li>• Allow microphone access when prompted</li>
              <li>• Use voice commands like "next step" or "emergency"</li>
            </ul>
          </motion.div>
        )}
      </div>

      {/* Audio Visualization */}
      {isListening && (
        <motion.div
          className="mt-4 flex justify-center items-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-blue-500 rounded-full"
              animate={{
                height: [4, 4 + audioLevel * 20 + Math.random() * 10, 4],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default VoiceInput;
