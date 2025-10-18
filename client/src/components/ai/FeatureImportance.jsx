import { TrendingUp, AlertTriangle, Brain } from 'lucide-react';
import { getCategoryColor } from '../../utils/featureImportance';
import Card from '../common/Card';

/**
 * Enhanced Feature Importance component with improved accessibility and visual design
 * Shows which factors most influenced the AI's triage decision
 */
const FeatureImportance = ({ features, language }) => {
  if (!features || features.length === 0) {
    return null;
  }

  // Sort features by importance value
  const sortedFeatures = [...features].sort((a, b) => b.value - a.value);

  return (
    <Card variant="compact" className="border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h4 className="text-lg font-bold text-gray-800 dark:text-white">
          AI Decision Factors
        </h4>
      </div>

      <div className="space-y-4">
        {sortedFeatures.map((feature, index) => (
          <div 
            key={index} 
            className="space-y-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            role="listitem"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {index === 0 && (
                  <AlertTriangle 
                    className="w-4 h-4 text-orange-500 animate-pulse" 
                    aria-label="Most important factor"
                  />
                )}
                <span className={`text-sm font-semibold ${getCategoryColor(feature.category)}`}>
                  {feature.name}
                </span>
                {index === 0 && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium dark:bg-orange-900 dark:text-orange-200">
                    Primary
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {Math.round(feature.value)}%
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  influence
                </div>
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ease-out ${
                    feature.value > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    feature.value > 60 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                    feature.value > 40 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}
                  style={{ 
                    width: `${feature.value}%`,
                    animation: `slideIn 0.7s ease-out ${index * 0.1}s both`
                  }}
                  role="progressbar"
                  aria-valuenow={feature.value}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${feature.name} importance: ${feature.value}%`}
                />
              </div>
              
              {/* Threshold markers */}
              <div className="absolute top-0 left-1/2 w-px h-3 bg-gray-400 opacity-50"></div>
              <div className="absolute top-0 left-3/4 w-px h-3 bg-gray-400 opacity-50"></div>
            </div>

            {/* Explanation */}
            <div className="bg-white dark:bg-gray-900 p-2 rounded border-l-4 border-gray-300 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="font-medium text-gray-700 dark:text-gray-300">Why this matters:</span>{' '}
                {feature.reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary and Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Confidence Level:
          </span>
          <span className={`font-bold ${
            sortedFeatures[0]?.value > 80 ? 'text-green-600' :
            sortedFeatures[0]?.value > 60 ? 'text-blue-600' :
            'text-orange-600'
          }`}>
            {sortedFeatures[0]?.value > 80 ? 'High' :
             sortedFeatures[0]?.value > 60 ? 'Moderate' : 'Low'}
          </span>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            <strong>Interpretation:</strong> These factors contributed most to the AI's triage decision.
            Higher percentages indicate stronger influence on the urgency classification.
            The primary factor had the most significant impact on the final prediction.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            width: 0%;
          }
          to {
            width: var(--target-width);
          }
        }
      `}</style>
    </Card>
  );
};

export default FeatureImportance;
