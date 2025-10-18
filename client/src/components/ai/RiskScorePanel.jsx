import { ShieldAlert, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { calculateEscalationRisk, detectVitalAnomalies } from '../../utils/riskAnalysis';
import Card from '../common/Card';

/**
 * Enhanced Risk Score Panel with improved visual design and accessibility
 * Displays escalation risk analysis and vital sign anomalies
 */
const Badge = ({ level, className = '' }) => {
  const variants = {
    Critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700',
    High: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-700',
    Moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-700'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${variants[level] || variants.Low} ${className}`}>
      {level}
    </span>
  );
};

const RiskScorePanel = ({ patient }) => {
  if (!patient) return null;

  const risk = calculateEscalationRisk(patient);
  const anomalies = detectVitalAnomalies(patient);

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 dark:text-red-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    if (score >= 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = (score) => {
    if (score >= 70) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (score >= 40) return 'bg-gradient-to-r from-orange-500 to-orange-600';
    if (score >= 20) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-green-500 to-green-600';
  };

  return (
    <Card variant="compact" className="border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">
              Escalation Risk Analysis
            </h4>
          </div>
          <Badge level={risk.level} />
        </div>

        {/* Risk Score Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Risk Score
            </span>
            <span className={`text-2xl font-bold ${getRiskColor(risk.score)}`}>
              {risk.score}%
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${getProgressColor(risk.score)}`}
                style={{ width: `${risk.score}%` }}
                role="progressbar"
                aria-valuenow={risk.score}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={`Escalation risk: ${risk.score}%`}
              />
            </div>
            
            {/* Risk thresholds */}
            <div className="absolute top-0 left-1/5 w-px h-4 bg-white opacity-50"></div>
            <div className="absolute top-0 left-2/5 w-px h-4 bg-white opacity-50"></div>
            <div className="absolute top-0 left-4/5 w-px h-4 bg-white opacity-50"></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Critical</span>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            {risk.recommendation}
          </p>
        </div>

        {/* Contributing Factors */}
        {risk.factors && risk.factors.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Key Risk Factors</span>
            </h5>
            
            <div className="grid grid-cols-1 gap-2">
              {risk.factors.slice(0, 4).map((factor, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      factor.impact === 'high' ? 'bg-red-500' :
                      factor.impact === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {factor.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    +{factor.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vital Anomalies */}
        {anomalies && anomalies.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span>Detected Anomalies</span>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full dark:bg-red-900 dark:text-red-200">
                {anomalies.length}
              </span>
            </h5>
            
            <div className="space-y-2">
              {anomalies.map((anomaly, idx) => (
                <div 
                  key={idx}
                  className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700"
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {anomaly.vital}: {anomaly.value} {anomaly.unit}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                      {anomaly.severity} - {anomaly.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            <strong>Note:</strong> This risk assessment is based on current vital signs, symptoms, and medical history. 
            Higher scores indicate increased likelihood of requiring escalated care within the next 24 hours.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default RiskScorePanel;
