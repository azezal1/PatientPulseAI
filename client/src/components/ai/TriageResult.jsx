import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from '../../i18n/translations';
import FeatureImportance from './FeatureImportance';
import RiskScorePanel from './RiskScorePanel';
import ConfidenceHeatmap from './ConfidenceHeatmap';
import EmergencyOverride from './EmergencyOverride';
import ConfidenceGauge from './ConfidenceGauge';
import Card from '../common/Card';

/**
 * Enhanced Triage Result component with comprehensive AI insights
 * Displays prediction results, confidence metrics, and explainability features
 */
const TriageResult = ({ language, prediction, patient, onOverride, isLoading }) => {
  const { t } = useTranslation(language);

  const getUrgencyConfig = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return {
          color: 'critical',
          bgClass: 'bg-red-50 dark:bg-red-900/20',
          textClass: 'text-red-900 dark:text-red-100',
          borderClass: 'border-red-500',
          icon: AlertCircle,
          label: t('result.critical'),
          message: t('result.criticalMessage'),
          animate: true
        };
      case 'Urgent':
        return {
          color: 'urgent',
          bgClass: 'bg-orange-50 dark:bg-orange-900/20',
          textClass: 'text-orange-900 dark:text-orange-100',
          borderClass: 'border-orange-500',
          icon: Clock,
          label: t('result.urgent'),
          message: t('result.urgentMessage'),
          animate: false
        };
      case 'Non-Urgent':
        return {
          color: 'nonurgent',
          bgClass: 'bg-green-50 dark:bg-green-900/20',
          textClass: 'text-green-900 dark:text-green-100',
          borderClass: 'border-green-500',
          icon: CheckCircle,
          label: t('result.nonUrgent'),
          message: t('result.nonUrgentMessage'),
          animate: false
        };
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card>
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {t('result.waiting')}
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            {t('result.waitingMessage')}
          </p>
        </div>
      </Card>
    );
  }

  const config = getUrgencyConfig(prediction.urgency);
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Card className={`border-4 ${config.borderClass} ${config.animate ? 'animate-pulse' : ''}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t('result.title')}
          </h2>
          
          {/* Main Result */}
          <div className={`${config.bgClass} rounded-xl p-6 mb-4`}>
            <div className="flex items-center justify-center mb-4">
              <Icon className={`w-12 h-12 ${config.textClass}`} />
            </div>
            <h3 className={`text-3xl font-bold ${config.textClass} mb-2`}>
              {config.label}
            </h3>
            <p className={`text-lg ${config.textClass} opacity-90`}>
              {config.message}
            </p>
          </div>

          {/* Confidence Gauge */}
          <ConfidenceGauge 
            confidence={prediction.confidence} 
            urgency={prediction.urgency}
          />
        </div>

        {/* Probability Distribution */}
        {prediction.probabilities && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
              {t('result.probabilityDistribution')}
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-700 dark:text-red-300 font-medium">Critical</span>
                <span className="font-bold">{prediction.probabilities.critical}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${prediction.probabilities.critical}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-700 dark:text-orange-300 font-medium">Urgent</span>
                <span className="font-bold">{prediction.probabilities.urgent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${prediction.probabilities.urgent}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700 dark:text-green-300 font-medium">Non-Urgent</span>
                <span className="font-bold">{prediction.probabilities.nonUrgent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${prediction.probabilities.nonUrgent}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Heatmap */}
        {patient && (
          <ConfidenceHeatmap patient={patient} prediction={prediction} />
        )}

        {/* Risk Score Panel */}
        {patient && <RiskScorePanel patient={patient} />}

        {/* Feature Importance */}
        {prediction.featureImportance && prediction.featureImportance.length > 0 && (
          <FeatureImportance features={prediction.featureImportance} language={language} />
        )}

        {/* Emergency Override */}
        <EmergencyOverride prediction={prediction} onOverride={onOverride} />

        {/* AI Badge */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Powered by TensorFlow.js AI Model</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TriageResult;
