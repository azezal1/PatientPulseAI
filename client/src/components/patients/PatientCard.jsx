import { Eye, Clock, User, Activity, Heart, Thermometer } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * Enhanced Patient Card component with urgency color coding and quick actions
 * Displays patient information in a visually appealing card format
 */
const PatientCard = ({ patient, onView, onSelect, isSelected = false }) => {
  const getUrgencyConfig = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return {
          bgClass: 'bg-red-50 dark:bg-red-900/20',
          borderClass: 'border-red-300 dark:border-red-700',
          textClass: 'text-red-800 dark:text-red-200',
          badgeClass: 'bg-red-600 text-white',
          iconClass: 'text-red-600 dark:text-red-400'
        };
      case 'Urgent':
        return {
          bgClass: 'bg-orange-50 dark:bg-orange-900/20',
          borderClass: 'border-orange-300 dark:border-orange-700',
          textClass: 'text-orange-800 dark:text-orange-200',
          badgeClass: 'bg-orange-600 text-white',
          iconClass: 'text-orange-600 dark:text-orange-400'
        };
      case 'Non-Urgent':
        return {
          bgClass: 'bg-green-50 dark:bg-green-900/20',
          borderClass: 'border-green-300 dark:border-green-700',
          textClass: 'text-green-800 dark:text-green-200',
          badgeClass: 'bg-green-600 text-white',
          iconClass: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          bgClass: 'bg-gray-50 dark:bg-gray-800/50',
          borderClass: 'border-gray-300 dark:border-gray-700',
          textClass: 'text-gray-800 dark:text-gray-200',
          badgeClass: 'bg-gray-600 text-white',
          iconClass: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const config = getUrgencyConfig(patient.urgency);
  const timeAgo = new Date(patient.timestamp).toLocaleString();

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(patient);
    }
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (onView) {
      onView(patient);
    }
  };

  return (
    <Card
      interactive={!!onSelect}
      onClick={handleCardClick}
      className={`transition-all duration-200 ${config.bgClass} ${config.borderClass} ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${onSelect ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${config.bgClass}`}>
              <User className={`w-5 h-5 ${config.iconClass}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {patient.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {patient.age} years • {patient.gender}
              </p>
            </div>
          </div>

          {/* Urgency Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badgeClass}`}>
            {patient.urgency}
          </span>
        </div>

        {/* Symptoms */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Symptoms
          </h4>
          <div className="flex flex-wrap gap-1">
            {(patient.symptoms || []).slice(0, 4).map((symptom, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                {symptom}
              </span>
            ))}
            {(patient.symptoms || []).length > 4 && (
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded text-xs">
                +{(patient.symptoms || []).length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Heart Rate</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {patient.vitals?.heartRate || 'N/A'} bpm
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">O2 Sat</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {patient.vitals?.oxygenSaturation || 'N/A'}%
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Temp</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {patient.vitals?.temperature || 'N/A'}°C
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">BP</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {patient.vitals?.bloodPressure || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* AI Confidence */}
        {patient.confidence && (
          <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-600 dark:text-gray-400">AI Confidence</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    patient.confidence >= 80 ? 'bg-green-500' :
                    patient.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${patient.confidence}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-800 dark:text-white">
                {patient.confidence}%
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>

          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewClick}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PatientCard;
