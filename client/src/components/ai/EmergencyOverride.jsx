import { useState } from 'react';
import { ToggleLeft, ToggleRight, AlertTriangle, CheckCircle2, Settings } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * Enhanced Emergency Override component for demo purposes
 * Allows manual adjustment of AI predictions with improved UX
 */
const EmergencyOverride = ({ prediction, onOverride }) => {
  const [enabled, setEnabled] = useState(false);
  const [manualUrgency, setManualUrgency] = useState(prediction?.urgency || 'Urgent');
  const [manualConfidence, setManualConfidence] = useState(prediction?.confidence || 85);
  const [reason, setReason] = useState('');

  const applyOverride = () => {
    if (!enabled) return;
    
    const overrideData = {
      urgency: manualUrgency,
      confidence: manualConfidence,
      overridden: true,
      overrideReason: reason || 'Manual override applied',
      originalPrediction: {
        urgency: prediction?.urgency,
        confidence: prediction?.confidence
      }
    };
    
    onOverride && onOverride(overrideData);
  };

  const resetToOriginal = () => {
    if (prediction) {
      setManualUrgency(prediction.urgency);
      setManualConfidence(prediction.confidence);
      setReason('');
    }
  };

  const urgencyOptions = [
    { value: 'Critical', color: 'text-red-600', description: 'Life-threatening condition' },
    { value: 'Urgent', color: 'text-orange-600', description: 'Requires prompt attention' },
    { value: 'Non-Urgent', color: 'text-green-600', description: 'Standard care queue' }
  ];

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 90) return { level: 'Very High', color: 'text-green-600' };
    if (confidence >= 75) return { level: 'High', color: 'text-blue-600' };
    if (confidence >= 60) return { level: 'Moderate', color: 'text-orange-600' };
    return { level: 'Low', color: 'text-red-600' };
  };

  const confidenceInfo = getConfidenceLevel(manualConfidence);

  return (
    <Card variant="compact" className="border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                Emergency Override
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Demo control for manual AI adjustment
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setEnabled(!enabled)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              enabled 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-md' 
                : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
            }`}
            aria-label={`Override ${enabled ? 'enabled' : 'disabled'}`}
          >
            {enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>{enabled ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>

        {/* Override Controls */}
        <div className={`space-y-4 transition-opacity duration-200 ${enabled ? 'opacity-100' : 'opacity-50'}`}>
          {/* Original vs Override Comparison */}
          {prediction && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Prediction Comparison
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Original AI:</span>
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {prediction.urgency} ({prediction.confidence}%)
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Override:</span>
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {manualUrgency} ({manualConfidence}%)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Urgency Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Urgency Level
            </label>
            <select
              disabled={!enabled}
              value={manualUrgency}
              onChange={(e) => setManualUrgency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Select urgency level"
            >
              {urgencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.value} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence Slider */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confidence Level
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="100"
                disabled={!enabled}
                value={manualConfidence}
                onChange={(e) => setManualConfidence(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Adjust confidence level"
              />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">1%</span>
                <div className="text-center">
                  <span className={`font-bold text-lg ${confidenceInfo.color}`}>
                    {manualConfidence}%
                  </span>
                  <div className={`text-xs ${confidenceInfo.color}`}>
                    {confidenceInfo.level}
                  </div>
                </div>
                <span className="text-gray-500 dark:text-gray-400">100%</span>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Override Reason (Optional)
            </label>
            <textarea
              disabled={!enabled}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for manual override..."
              rows="2"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToOriginal}
              disabled={!enabled}
              className="text-gray-600 dark:text-gray-400"
            >
              Reset to Original
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEnabled(false)}
                disabled={!enabled}
              >
                Cancel
              </Button>
              
              <Button
                variant="warning"
                size="sm"
                onClick={applyOverride}
                disabled={!enabled}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Apply Override
              </Button>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-300 dark:border-yellow-600">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
              <strong>Demo Feature:</strong> This override functionality is for demonstration purposes only. 
              In a production environment, such overrides would require proper authorization, audit logging, 
              and clinical justification.
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmergencyOverride;
