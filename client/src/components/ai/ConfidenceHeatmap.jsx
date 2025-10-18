import { Thermometer, Heart, Activity, Gauge } from 'lucide-react';
import Card from '../common/Card';

/**
 * Enhanced Confidence Heatmap showing how vital signs influence AI predictions
 * Visual representation of which vitals contribute most to the confidence score
 */
const ConfidenceHeatmap = ({ patient, prediction }) => {
  if (!patient || !prediction) return null;

  const vitals = patient.vitals;
  
  // Calculate normalized deviation scores (0 = normal, 1 = highly abnormal)
  const calculateDeviationScore = (value, normal, range) => {
    const deviation = Math.abs(value - normal) / range;
    return Math.min(1, deviation);
  };

  const normalizeBP = (bp) => {
    const [systolic, diastolic] = bp.split('/').map(Number);
    const systolicDev = Math.abs(systolic - 120) / 80;
    const diastolicDev = Math.abs(diastolic - 80) / 60;
    return Math.min(1, (systolicDev + diastolicDev) / 2);
  };

  // Calculate influence scores for each vital
  const vitalInfluences = [
    {
      name: 'Heart Rate',
      icon: Heart,
      value: vitals.heartRate,
      unit: 'bpm',
      normalRange: '60-100',
      score: calculateDeviationScore(vitals.heartRate, 75, 75),
      interpretation: vitals.heartRate > 100 ? 'Elevated' : vitals.heartRate < 60 ? 'Low' : 'Normal'
    },
    {
      name: 'Oxygen Saturation',
      icon: Activity,
      value: vitals.oxygenSaturation,
      unit: '%',
      normalRange: '95-100',
      score: Math.min(1, (98 - Math.min(98, vitals.oxygenSaturation)) / 20),
      interpretation: vitals.oxygenSaturation < 95 ? 'Critical' : vitals.oxygenSaturation < 98 ? 'Low' : 'Normal'
    },
    {
      name: 'Temperature',
      icon: Thermometer,
      value: vitals.temperature,
      unit: '°C',
      normalRange: '36.1-37.2',
      score: calculateDeviationScore(vitals.temperature, 37, 3.5),
      interpretation: vitals.temperature > 38 ? 'Fever' : vitals.temperature < 36 ? 'Hypothermia' : 'Normal'
    },
    {
      name: 'Blood Pressure',
      icon: Gauge,
      value: vitals.bloodPressure,
      unit: '',
      normalRange: '90/60-140/90',
      score: normalizeBP(vitals.bloodPressure),
      interpretation: (() => {
        const [sys, dia] = vitals.bloodPressure.split('/').map(Number);
        if (sys > 140 || dia > 90) return 'High';
        if (sys < 90 || dia < 60) return 'Low';
        return 'Normal';
      })()
    }
  ];

  const getInfluenceColor = (score) => {
    if (score >= 0.75) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (score >= 0.5) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    if (score >= 0.25) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  };

  const getInfluenceLevel = (score) => {
    if (score >= 0.75) return { level: 'High', color: 'text-red-600 dark:text-red-400' };
    if (score >= 0.5) return { level: 'Moderate', color: 'text-orange-600 dark:text-orange-400' };
    if (score >= 0.25) return { level: 'Low', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'Minimal', color: 'text-green-600 dark:text-green-400' };
  };

  const getInterpretationColor = (interpretation) => {
    if (interpretation === 'Critical' || interpretation === 'High' || interpretation === 'Fever') {
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    }
    if (interpretation === 'Low' || interpretation === 'Hypothermia' || interpretation === 'Elevated') {
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
    }
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
  };

  return (
    <Card variant="compact" className="border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="text-lg font-bold text-gray-800 dark:text-white">
            Vital Signs Impact Analysis
          </h4>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          How each vital sign influences the AI's confidence in the triage decision
        </p>

        {/* Vital Signs Grid */}
        <div className="space-y-4">
          {vitalInfluences.map((vital, index) => {
            const Icon = vital.icon;
            const influence = getInfluenceLevel(vital.score);
            
            return (
              <div 
                key={vital.name}
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h5 className="font-semibold text-gray-800 dark:text-white">
                        {vital.name}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Normal: {vital.normalRange}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                      {vital.value}{vital.unit}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getInterpretationColor(vital.interpretation)}`}>
                      {vital.interpretation}
                    </span>
                  </div>
                </div>

                {/* Influence Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      AI Influence Level
                    </span>
                    <span className={`font-semibold ${influence.color}`}>
                      {influence.level} ({Math.round(vital.score * 100)}%)
                    </span>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-700 ease-out ${getInfluenceColor(vital.score)}`}
                        style={{ 
                          width: `${vital.score * 100}%`,
                          animation: `slideIn 0.7s ease-out ${index * 0.1}s both`
                        }}
                        role="progressbar"
                        aria-valuenow={vital.score * 100}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`${vital.name} influence: ${Math.round(vital.score * 100)}%`}
                      />
                    </div>
                    
                    {/* Threshold markers */}
                    <div className="absolute top-0 left-1/4 w-px h-3 bg-white opacity-50"></div>
                    <div className="absolute top-0 left-1/2 w-px h-3 bg-white opacity-50"></div>
                    <div className="absolute top-0 left-3/4 w-px h-3 bg-white opacity-50"></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Minimal</span>
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Impact Summary
          </h5>
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            The AI considers abnormal vital signs as key indicators for triage urgency. 
            Higher influence scores indicate vitals that significantly deviate from normal ranges, 
            contributing more weight to the final urgency classification.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { width: 0%; }
          to { width: var(--target-width); }
        }
      `}</style>
    </Card>
  );
};

export default ConfidenceHeatmap;
