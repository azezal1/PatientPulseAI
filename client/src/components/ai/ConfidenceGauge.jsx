/**
 * Confidence Gauge component - displays AI prediction confidence as a circular gauge
 * Provides visual feedback on model certainty with color-coded indicators
 */
const ConfidenceGauge = ({ confidence = 0, urgency = 'Non-Urgent', size = 'md' }) => {
  const normalizedConfidence = Math.max(0, Math.min(100, confidence));
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedConfidence / 100) * circumference;
  
  const sizes = {
    sm: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-sm' },
    md: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-lg' },
    lg: { width: 160, height: 160, strokeWidth: 10, fontSize: 'text-xl' }
  };
  
  const config = sizes[size];
  
  // Color based on confidence level and urgency
  const getColor = () => {
    if (normalizedConfidence >= 90) return 'text-green-600';
    if (normalizedConfidence >= 75) return 'text-blue-600';
    if (normalizedConfidence >= 60) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getStrokeColor = () => {
    if (normalizedConfidence >= 90) return '#059669'; // green-600
    if (normalizedConfidence >= 75) return '#2563eb'; // blue-600
    if (normalizedConfidence >= 60) return '#ea580c'; // orange-600
    return '#dc2626'; // red-600
  };
  
  const getConfidenceLabel = () => {
    if (normalizedConfidence >= 90) return 'Very High';
    if (normalizedConfidence >= 75) return 'High';
    if (normalizedConfidence >= 60) return 'Moderate';
    return 'Low';
  };
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <svg
          width={config.width}
          height={config.height}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r="45"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r="45"
            stroke={getStrokeColor()}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${config.fontSize} ${getColor()}`}>
            {Math.round(normalizedConfidence)}%
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Confidence
          </span>
        </div>
      </div>
      
      {/* Labels */}
      <div className="text-center">
        <div className={`font-semibold ${getColor()}`}>
          {getConfidenceLabel()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          AI Certainty Level
        </div>
      </div>
      
      {/* Confidence interpretation */}
      <div className="text-center max-w-xs">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {normalizedConfidence >= 90 && "The AI is very confident in this prediction."}
          {normalizedConfidence >= 75 && normalizedConfidence < 90 && "The AI has high confidence in this prediction."}
          {normalizedConfidence >= 60 && normalizedConfidence < 75 && "The AI has moderate confidence. Consider additional assessment."}
          {normalizedConfidence < 60 && "Low confidence. Manual review recommended."}
        </p>
      </div>
    </div>
  );
};

export default ConfidenceGauge;
