import { Clock, Activity, Heart, Stethoscope, FileText, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';

/**
 * Enhanced Patient Timeline component showing chronological care events
 * Displays admission, vitals, triage, and other medical events in timeline format
 */
const PatientTimeline = ({ patient }) => {
  if (!patient) return null;

  // Generate comprehensive timeline events from patient data
  const generateTimelineEvents = () => {
    const baseTime = new Date(patient.timestamp);
    const events = [];

    // Admission event
    events.push({
      id: 'admission',
      time: baseTime,
      type: 'admission',
      title: 'Patient Admission',
      description: `${patient.name} (${patient.age}y, ${patient.gender}) arrived at emergency room`,
      icon: Activity,
      color: 'blue',
      priority: 'high'
    });

    // Symptoms recording (1 minute after admission)
    if (patient.symptoms && patient.symptoms.length > 0) {
      events.push({
        id: 'symptoms',
        time: new Date(baseTime.getTime() + 1 * 60 * 1000),
        type: 'symptoms',
        title: 'Symptoms Documented',
        description: `Reported symptoms: ${patient.symptoms.slice(0, 3).join(', ')}${patient.symptoms.length > 3 ? ` and ${patient.symptoms.length - 3} more` : ''}`,
        icon: Stethoscope,
        color: 'purple',
        priority: 'medium'
      });
    }

    // Vitals recording (3 minutes after admission)
    if (patient.vitals) {
      events.push({
        id: 'vitals',
        time: new Date(baseTime.getTime() + 3 * 60 * 1000),
        type: 'vitals',
        title: 'Vital Signs Recorded',
        description: `HR: ${patient.vitals.heartRate} bpm, BP: ${patient.vitals.bloodPressure}, Temp: ${patient.vitals.temperature}°C, O2: ${patient.vitals.oxygenSaturation}%`,
        icon: Heart,
        color: 'green',
        priority: 'high'
      });
    }

    // Medical history (5 minutes after admission)
    if (patient.medicalHistory && patient.medicalHistory !== 'None') {
      events.push({
        id: 'history',
        time: new Date(baseTime.getTime() + 5 * 60 * 1000),
        type: 'history',
        title: 'Medical History Reviewed',
        description: patient.medicalHistory.length > 100 
          ? `${patient.medicalHistory.substring(0, 100)}...` 
          : patient.medicalHistory,
        icon: FileText,
        color: 'gray',
        priority: 'low'
      });
    }

    // AI Triage assessment (7 minutes after admission)
    events.push({
      id: 'triage',
      time: new Date(baseTime.getTime() + 7 * 60 * 1000),
      type: 'triage',
      title: 'AI Triage Assessment Completed',
      description: `Urgency Level: ${patient.urgency} (${patient.confidence}% confidence)`,
      icon: Activity,
      color: patient.urgency === 'Critical' ? 'red' : patient.urgency === 'Urgent' ? 'orange' : 'green',
      priority: 'critical'
    });

    // Add critical alert if applicable (8 minutes after admission)
    if (patient.urgency === 'Critical') {
      events.push({
        id: 'alert',
        time: new Date(baseTime.getTime() + 8 * 60 * 1000),
        type: 'alert',
        title: 'Critical Patient Alert Triggered',
        description: 'Automatic notification sent to medical staff for immediate attention',
        icon: AlertTriangle,
        color: 'red',
        priority: 'critical'
      });
    }

    return events.sort((a, b) => a.time - b.time);
  };

  const timelineEvents = generateTimelineEvents();

  const getIconStyles = (color, priority) => {
    const baseStyles = 'w-8 h-8 p-1.5 rounded-full flex items-center justify-center';
    const colorStyles = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      red: 'bg-red-500 text-white',
      orange: 'bg-orange-500 text-white',
      purple: 'bg-purple-500 text-white',
      gray: 'bg-gray-500 text-white'
    };
    
    const priorityStyles = priority === 'critical' ? 'ring-2 ring-red-300 ring-offset-2' : '';
    
    return `${baseStyles} ${colorStyles[color] || colorStyles.gray} ${priorityStyles}`;
  };

  const getLineColor = (color) => {
    const colors = {
      blue: 'bg-blue-200 dark:bg-blue-800',
      green: 'bg-green-200 dark:bg-green-800',
      red: 'bg-red-200 dark:bg-red-800',
      orange: 'bg-orange-200 dark:bg-orange-800',
      purple: 'bg-purple-200 dark:bg-purple-800',
      gray: 'bg-gray-200 dark:bg-gray-700'
    };
    return colors[color] || colors.gray;
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      admission: 'Admission',
      symptoms: 'Assessment',
      vitals: 'Vitals',
      history: 'History',
      triage: 'AI Analysis',
      alert: 'Alert'
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Patient Care Timeline
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chronological view of {patient.name}'s care events
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {timelineEvents.map((event, index) => {
            const Icon = event.icon;
            const isLast = index === timelineEvents.length - 1;
            
            return (
              <div key={event.id} className="relative flex items-start space-x-4 pb-8">
                {/* Timeline Line */}
                {!isLast && (
                  <div className={`absolute left-4 top-8 w-0.5 h-full ${getLineColor(event.color)}`} />
                )}
                
                {/* Event Icon */}
                <div className={getIconStyles(event.color, event.priority)}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
                        {event.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        event.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        event.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                    </div>
                    <time className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {formatTime(event.time)}
                    </time>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {event.description}
                  </p>
                  
                  {/* Additional context for specific event types */}
                  {event.type === 'triage' && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">AI Confidence</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                patient.confidence >= 80 ? 'bg-green-500' :
                                patient.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${patient.confidence}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {patient.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Timeline Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-blue-700 dark:text-blue-300">
            <div>
              <span className="font-medium">Total Events:</span> {timelineEvents.length}
            </div>
            <div>
              <span className="font-medium">Duration:</span> ~8 minutes
            </div>
            <div>
              <span className="font-medium">Final Status:</span> {patient.urgency}
            </div>
            <div>
              <span className="font-medium">Confidence:</span> {patient.confidence}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PatientTimeline;
