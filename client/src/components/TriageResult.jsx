import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from '../i18n/translations';
import FeatureImportance from './FeatureImportance';
import RiskScorePanel from './RiskScorePanel';
import ConfidenceHeatmap from './ConfidenceHeatmap';
import EmergencyOverride from './EmergencyOverride';

const TriageResult = ({ language, prediction, patient, onOverride, isLoading }) => {
  const { t } = useTranslation(language);

  const getUrgencyConfig = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return {
          color: 'critical',
          bgClass: 'bg-critical-light',
          textClass: 'text-critical-dark',
          borderClass: 'border-critical',
          icon: AlertCircle,
          label: t('result.critical'),
          message: t('result.criticalMessage'),
          animate: true
        };
      case 'Urgent':
        return {
          color: 'urgent',
          bgClass: 'bg-urgent-light',
          textClass: 'text-urgent-dark',
          borderClass: 'border-urgent',
          icon: Clock,
          label: t('result.urgent'),
          message: t('result.urgentMessage'),
          animate: false
        };
      case 'Non-Urgent':
        return {
          color: 'nonurgent',
          bgClass: 'bg-nonurgent-light',
          textClass: 'text-nonurgent-dark',
          borderClass: 'border-nonurgent',
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
      <div className="card p-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('result.title')}</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold">Analyzing patient data...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">AI model processing vitals and symptoms</p>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="card p-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('result.title')}</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('result.noResult')}</p>
        </div>
      </div>
    );
  }

  const config = getUrgencyConfig(prediction.urgency);
  const Icon = config.icon;

  return (
    <div className={`card p-6 dark:bg-gray-800 dark:border-gray-700 border-4 ${config.borderClass} ${config.animate ? 'animate-flash' : ''}`}>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('result.title')}</h2>

      {/* Urgency Level */}
      <div className={`${config.bgClass} dark:bg-opacity-20 rounded-xl p-6 mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('result.urgency')}</span>
          <Icon className={`w-8 h-8 ${config.textClass}`} />
        </div>
        <h3 className={`text-4xl font-bold ${config.textClass} mb-2`}>
          {config.label}
        </h3>
        <p className={`${config.textClass} font-medium`}>
          {config.message}
        </p>
      </div>

      {/* Confidence Score */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('result.confidence')}</span>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">{prediction.confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${prediction.confidence}%` }}
          ></div>
        </div>
      </div>

      {/* Probability Distribution (if available) */}
      {prediction.probabilities && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">AI Confidence Distribution</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Critical</span>
              <span className="font-semibold text-critical">{prediction.probabilities.critical}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-critical rounded-full h-2 transition-all duration-500"
                style={{ width: `${prediction.probabilities.critical}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Urgent</span>
              <span className="font-semibold text-urgent">{prediction.probabilities.urgent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-urgent rounded-full h-2 transition-all duration-500"
                style={{ width: `${prediction.probabilities.urgent}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Non-Urgent</span>
              <span className="font-semibold text-nonurgent">{prediction.probabilities.nonUrgent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-nonurgent rounded-full h-2 transition-all duration-500"
                style={{ width: `${prediction.probabilities.nonUrgent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Confidence Heatmap (Vitals influence) */}
      {patient && (
        <ConfidenceHeatmap patient={patient} prediction={prediction} />
      )}

      {/* Risk score & anomalies */}
      {patient && <RiskScorePanel patient={patient} />}

      {/* Feature Importance */}
      {prediction.featureImportance && prediction.featureImportance.length > 0 && (
        <FeatureImportance features={prediction.featureImportance} language={language} />
      )}

      {/* Emergency Override (demo) */}
      <EmergencyOverride prediction={prediction} onOverride={onOverride} />

      {/* AI Badge */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Powered by TensorFlow.js AI Model</span>
        </div>
      </div>
    </div>
  );
};

export default TriageResult;
