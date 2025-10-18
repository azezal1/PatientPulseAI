import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Zap, Users } from 'lucide-react';
import { patientAPI } from '../utils/api';
import triageAI from '../utils/triageAI';

const SIMULATION_TEMPLATES = [
  {
    name: 'John Martinez',
    age: 67,
    gender: 'Male',
    symptoms: ['Chest Pain', 'Shortness of Breath', 'Sweating'],
    vitals: { heartRate: 118, bloodPressure: '165/98', temperature: 37.4, oxygenSaturation: 91 },
    medicalHistory: 'Heart Disease, Hypertension'
  },
  {
    name: 'Sarah Chen',
    age: 34,
    gender: 'Female',
    symptoms: ['Severe Headache', 'Nausea', 'Vision Problems'],
    vitals: { heartRate: 92, bloodPressure: '145/90', temperature: 38.2, oxygenSaturation: 97 },
    medicalHistory: 'Migraine'
  },
  {
    name: 'Ahmed Hassan',
    age: 45,
    gender: 'Male',
    symptoms: ['Difficulty Breathing', 'Wheezing', 'Chest Tightness'],
    vitals: { heartRate: 105, bloodPressure: '138/88', temperature: 36.9, oxygenSaturation: 88 },
    medicalHistory: 'Asthma'
  },
  {
    name: 'Maria Rodriguez',
    age: 28,
    gender: 'Female',
    symptoms: ['Fever', 'Cough', 'Body Ache'],
    vitals: { heartRate: 86, bloodPressure: '122/78', temperature: 39.1, oxygenSaturation: 95 },
    medicalHistory: 'None'
  },
  {
    name: 'David Kim',
    age: 52,
    gender: 'Male',
    symptoms: ['Abdominal Pain', 'Vomiting', 'Dizziness'],
    vitals: { heartRate: 98, bloodPressure: '148/92', temperature: 37.8, oxygenSaturation: 96 },
    medicalHistory: 'Gastritis, Diabetes'
  },
  {
    name: 'Emma Thompson',
    age: 71,
    gender: 'Female',
    symptoms: ['Confusion', 'Weakness', 'Dizziness'],
    vitals: { heartRate: 112, bloodPressure: '170/102', temperature: 37.1, oxygenSaturation: 93 },
    medicalHistory: 'Stroke History, Hypertension'
  },
  {
    name: 'Carlos Silva',
    age: 19,
    gender: 'Male',
    symptoms: ['Fracture', 'Severe Pain', 'Swelling'],
    vitals: { heartRate: 88, bloodPressure: '125/80', temperature: 36.8, oxygenSaturation: 99 },
    medicalHistory: 'None'
  },
  {
    name: 'Lisa Wang',
    age: 56,
    gender: 'Female',
    symptoms: ['Difficulty Breathing', 'Chest Pain', 'Anxiety'],
    vitals: { heartRate: 115, bloodPressure: '158/94', temperature: 37.0, oxygenSaturation: 89 },
    medicalHistory: 'COPD, Heart Disease'
  }
];

const LiveSimulation = ({ onPatientAdded, language }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(5000); // milliseconds between patients
  const [patientsAdded, setPatientsAdded] = useState(0);
  const [lastPatient, setLastPatient] = useState(null);
  const intervalRef = useRef(null);

  const generateRandomPatient = () => {
    const template = SIMULATION_TEMPLATES[Math.floor(Math.random() * SIMULATION_TEMPLATES.length)];
    
    // Add some variation to vitals
    const variation = (value, range) => value + Math.floor(Math.random() * range) - range/2;
    
    return {
      ...template,
      name: `${template.name} ${Math.floor(Math.random() * 100)}`,
      age: variation(template.age, 10),
      vitals: {
        heartRate: variation(template.vitals.heartRate, 15),
        bloodPressure: template.vitals.bloodPressure,
        temperature: (template.vitals.temperature + (Math.random() * 1.5 - 0.75)).toFixed(1),
        oxygenSaturation: Math.max(85, Math.min(100, variation(template.vitals.oxygenSaturation, 5)))
      }
    };
  };

  const addSimulatedPatient = async () => {
    try {
      const patient = generateRandomPatient();
      
      // Get AI prediction
      const prediction = await triageAI.predict(patient);
      
      // Add to database
      const patientData = {
        ...patient,
        vitals: {
          ...patient.vitals,
          temperature: parseFloat(patient.vitals.temperature)
        },
        urgency: prediction.urgency,
        confidence: prediction.confidence
      };

      await patientAPI.create(patientData);
      
      setPatientsAdded(prev => prev + 1);
      setLastPatient({ ...patientData, urgency: prediction.urgency });
      
      if (onPatientAdded) {
        onPatientAdded();
      }

      // Voice announcement for critical patients
      if (prediction.urgency === 'Critical' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Critical patient alert: ${patient.name}, ${prediction.urgency} priority`
        );
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error adding simulated patient:', error);
    }
  };

  const startSimulation = () => {
    setIsRunning(true);
    addSimulatedPatient(); // Add one immediately
    intervalRef.current = setInterval(() => {
      addSimulatedPatient();
    }, speed);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetSimulation = () => {
    stopSimulation();
    setPatientsAdded(0);
    setLastPatient(null);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update interval when speed changes
  useEffect(() => {
    if (isRunning) {
      stopSimulation();
      startSimulation();
    }
  }, [speed]);

  return (
    <div className="card p-6 dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-pulse" />
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Live Patient Simulation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Auto-generate ER arrivals for testing</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isRunning ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 animate-pulse' : 
          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {isRunning ? '● LIVE' : '○ STOPPED'}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Simulation Speed
          </label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            disabled={isRunning}
          >
            <option value={2000}>Very Fast (2s)</option>
            <option value={5000}>Fast (5s)</option>
            <option value={10000}>Normal (10s)</option>
            <option value={20000}>Slow (20s)</option>
            <option value={30000}>Very Slow (30s)</option>
          </select>
        </div>

        <div className="flex items-end space-x-2">
          {!isRunning ? (
            <button
              onClick={startSimulation}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Start Simulation</span>
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Pause className="w-5 h-5" />
              <span>Stop</span>
            </button>
          )}
          <button
            onClick={resetSimulation}
            className="btn-secondary dark:bg-gray-700 dark:text-gray-300 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Patients Added</span>
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{patientsAdded}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Simulation Rate</span>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{speed/1000}s</p>
        </div>
      </div>

      {/* Last Patient Added */}
      {lastPatient && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">LAST PATIENT ADDED:</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">{lastPatient.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {lastPatient.age}yo {lastPatient.gender} • {lastPatient.symptoms.join(', ')}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              lastPatient.urgency === 'Critical' ? 'bg-red-500 text-white animate-pulse' :
              lastPatient.urgency === 'Urgent' ? 'bg-orange-500 text-white' :
              'bg-green-500 text-white'
            }`}>
              {lastPatient.urgency}
            </span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <p className="text-xs text-purple-900 dark:text-purple-100">
          <strong>Demo Mode:</strong> Automatically generates realistic ER patients with varied symptoms and vitals. 
          Critical patients trigger voice alerts. Use this to stress-test the system and dashboard analytics.
        </p>
      </div>
    </div>
  );
};

export default LiveSimulation;
