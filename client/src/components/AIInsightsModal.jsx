import { X, Brain, AlertTriangle, CheckCircle, TrendingUp, Heart, Activity, Thermometer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  en: {
    aiInsights: 'AI Triage Insights',
    priority: 'Priority Level',
    confidence: 'Confidence Score',
    reasoning: 'AI Reasoning',
    keyFactors: 'Key Factors',
    recommendations: 'Recommendations',
    close: 'Close',
    critical: 'Critical',
    urgent: 'Urgent',
    semiUrgent: 'Semi-Urgent',
    nonUrgent: 'Non-Urgent',
    highImpact: 'High Impact',
    mediumImpact: 'Medium Impact',
    lowImpact: 'Low Impact',
    noData: 'No data available'
  },
  hi: {
    aiInsights: 'AI ट्राइएज अंतर्दृष्टि',
    priority: 'प्राथमिकता स्तर',
    confidence: 'विश्वास स्कोर',
    reasoning: 'AI तर्क',
    keyFactors: 'मुख्य कारक',
    recommendations: 'सिफारिशें',
    close: 'बंद करें',
    critical: 'गंभीर',
    urgent: 'तत्काल',
    semiUrgent: 'अर्ध-तत्काल',
    nonUrgent: 'गैर-तत्काल',
    highImpact: 'उच्च प्रभाव',
    mediumImpact: 'मध्यम प्रभाव',
    lowImpact: 'कम प्रभाव',
    noData: 'कोई डेटा उपलब्ध नहीं'
  },
  ta: {
    aiInsights: 'AI ட்ரையேஜ் நுண்ணறிவு',
    priority: 'முன்னுரிமை நிலை',
    confidence: 'நம்பிக்கை மதிப்பெண்',
    reasoning: 'AI காரணம்',
    keyFactors: 'முக்கிய காரணிகள்',
    recommendations: 'பரிந்துரைகள்',
    close: 'மூடு',
    critical: 'முக்கியமான',
    urgent: 'அவசர',
    semiUrgent: 'அரை-அவசர',
    nonUrgent: 'அவசரமற்ற',
    highImpact: 'அதிக தாக்கம்',
    mediumImpact: 'நடுத்தர தாக்கம்',
    lowImpact: 'குறைந்த தாக்கம்',
    noData: 'தரவு கிடைக்கவில்லை'
  }
};

const AIInsightsModal = ({ isOpen, onClose, prediction, language = 'en' }) => {
  const t = translations[language] || translations.en;

  if (!isOpen || !prediction) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Urgent':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Semi-Urgent':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Non-Urgent':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Critical':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'Urgent':
        return <Activity className="w-6 h-6 text-orange-600" />;
      case 'Semi-Urgent':
        return <Heart className="w-6 h-6 text-yellow-600" />;
      case 'Non-Urgent':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <Activity className="w-6 h-6 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactIcon = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Activity className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t.aiInsights}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Priority and Confidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t.priority}
                </h3>
                <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getPriorityColor(prediction.urgency)}`}>
                  {getPriorityIcon(prediction.urgency)}
                  <div>
                    <p className="font-semibold text-lg">
                      {prediction.urgency || 'Unknown'}
                    </p>
                    <p className="text-sm opacity-75">
                      {prediction.riskLevel || 'Assessment complete'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t.confidence}
                </h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
                      {prediction.confidence || 0}%
                    </span>
                    <TrendingUp className={`w-6 h-6 ${getConfidenceColor(prediction.confidence)}`} />
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        (prediction.confidence || 0) >= 90 ? 'bg-green-500' :
                        (prediction.confidence || 0) >= 75 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${prediction.confidence || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            {prediction.reasoning && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t.reasoning}
                </h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-gray-700 dark:text-gray-300">
                    {prediction.reasoning}
                  </p>
                </div>
              </div>
            )}

            {/* Key Factors */}
            {prediction.factors && prediction.factors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t.keyFactors}
                </h3>
                <div className="space-y-3">
                  {prediction.factors.slice(0, 5).map((factor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-3 rounded-lg border ${getImpactColor(factor.impact)}`}
                    >
                      <div className="flex items-center space-x-3">
                        {getImpactIcon(factor.impact)}
                        <div>
                          <p className="font-medium">
                            {factor.factor || 'Unknown Factor'}
                          </p>
                          {factor.description && (
                            <p className="text-sm opacity-75">
                              {factor.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {factor.weight && (
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Weight: {Math.round(factor.weight)}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {prediction.recommendations && prediction.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t.recommendations}
                </h3>
                <div className="space-y-2">
                  {prediction.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300">
                        {recommendation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* No Data Message */}
            {!prediction.reasoning && (!prediction.factors || prediction.factors.length === 0) && (!prediction.recommendations || prediction.recommendations.length === 0) && (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">{t.noData}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIInsightsModal;
