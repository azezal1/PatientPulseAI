import { Clock, Activity, Heart, Thermometer, Wind } from 'lucide-react';

const PatientTimeline = ({ patient }) => {
  if (!patient) return null;

  // Generate timeline events from patient data
  const timelineEvents = [
    {
      id: 1,
      time: patient.timestamp,
      type: 'admission',
      title: 'Patient Admitted',
      description: `${patient.name} arrived at emergency room`,
      icon: Activity,
      color: 'blue'
    },
    {
      id: 2,
      time: patient.timestamp,
      type: 'vitals',
      title: 'Vitals Recorded',
      description: `HR: ${patient.vitals.heartRate} bpm, BP: ${patient.vitals.bloodPressure}, Temp: ${patient.vitals.temperature}°C, O2: ${patient.vitals.oxygenSaturation}%`,
      icon: Heart,
      color: 'green'
    },
    {
      id: 3,
      time: patient.timestamp,
      type: 'triage',
      title: 'AI Triage Assessment',
      description: `Urgency: ${patient.urgency} (${patient.confidence}% confidence)`,
      icon: Activity,
      color: patient.urgency === 'Critical' ? 'red' : patient.urgency === 'Urgent' ? 'orange' : 'green'
    }
  ];

  const getIconColor = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      red: 'bg-red-500 text-white',
      orange: 'bg-orange-500 text-white'
    };
    return colors[color] || 'bg-gray-500 text-white';
  };

  const getLineColor = (color) => {
    const colors = {
      blue: 'bg-blue-300 dark:bg-blue-700',
      green: 'bg-green-300 dark:bg-green-700',
      red: 'bg-red-300 dark:bg-red-700',
      orange: 'bg-orange-300 dark:bg-orange-700'
    };
    return colors[color] || 'bg-gray-300 dark:bg-gray-700';
  };

  return (
    <div className="card p-6 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center space-x-2">
        <Clock className="w-5 h-5" />
        <span>Patient Timeline</span>
      </h3>

      <div className="space-y-6">
        {timelineEvents.map((event, index) => {
          const Icon = event.icon;
          
          return (
            <div key={event.id} className="relative flex items-start space-x-4">
              {/* Timeline Line */}
              {index < timelineEvents.length - 1 && (
                <div className={`absolute left-5 top-12 w-0.5 h-16 ${getLineColor(event.color)}`} />
              )}

              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(event.color)} shadow-md z-10`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.time).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Card */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Current Status
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300">Duration:</span>{' '}
            <span className="font-semibold text-blue-900 dark:text-blue-100">
              {Math.round((Date.now() - new Date(patient.timestamp).getTime()) / 60000)} min
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Status:</span>{' '}
            <span className={`font-semibold px-2 py-0.5 rounded ${
              patient.urgency === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              patient.urgency === 'Urgent' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {patient.urgency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTimeline;
