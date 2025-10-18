import { TrendingUp, AlertTriangle } from 'lucide-react';
import { getCategoryColor } from '../utils/featureImportance';

const FeatureImportance = ({ features, language }) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-bold text-gray-800 dark:text-white">
          Key Factors in AI Decision
        </h4>
      </div>

      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {index === 0 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                <span className={`text-sm font-semibold ${getCategoryColor(feature.category)}`}>
                  {feature.name}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {Math.round(feature.value)}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  feature.value > 80 ? 'bg-red-500' :
                  feature.value > 60 ? 'bg-orange-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${feature.value}%` }}
              />
            </div>

            {/* Reason */}
            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
              {feature.reason}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>Note:</strong> These factors contributed most to the AI's triage decision.
          Higher percentages indicate stronger influence on the urgency classification.
        </p>
      </div>
    </div>
  );
};

export default FeatureImportance;
