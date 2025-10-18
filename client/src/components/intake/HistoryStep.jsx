import { FileText, Clock, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';

/**
 * Medical History Step - Step 4 of patient intake
 * Collects medical history and final review
 */
const HistoryStep = ({ formData, onChange, errors, t }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const commonConditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 
    'Allergies', 'Previous Surgery', 'Medications', 'None'
  ];

  const addCondition = (condition) => {
    const current = formData.medicalHistory || '';
    if (condition === 'None') {
      onChange({ medicalHistory: 'None' });
    } else if (!current.includes(condition)) {
      const newHistory = current ? `${current}, ${condition}` : condition;
      onChange({ medicalHistory: newHistory });
    }
  };

  // Summary data for review
  const getSummaryData = () => {
    return {
      basic: {
        name: formData.name,
        age: formData.age,
        gender: formData.gender
      },
      symptoms: formData.symptoms,
      vitals: formData.vitals,
      history: formData.medicalHistory
    };
  };

  const summary = getSummaryData();

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mx-auto mb-4">
            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('form.step4.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('form.step4.description')}
          </p>
        </div>

        {/* Medical History Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medical History
            </label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Enter relevant medical history, current medications, allergies, previous surgeries, chronic conditions..."
              rows="4"
              className="w-full px-4 py-3 text-sm rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-purple-400 transition-colors duration-200 resize-none"
            />
            {errors.medicalHistory && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                {errors.medicalHistory}
              </p>
            )}
          </div>

          {/* Quick Add Common Conditions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Common Conditions (Click to add)
            </h4>
            <div className="flex flex-wrap gap-2">
              {commonConditions.map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => addCondition(condition)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 flex items-center space-x-1 ${
                    condition === 'None'
                      ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      : 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  }`}
                >
                  <span>{condition}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Summary Review */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Patient Summary Review</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Basic Information
              </h5>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div><strong>Name:</strong> {summary.basic.name || 'Not provided'}</div>
                <div><strong>Age:</strong> {summary.basic.age || 'Not provided'} years</div>
                <div><strong>Gender:</strong> {summary.basic.gender}</div>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Symptoms ({summary.symptoms.length})
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {summary.symptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {summary.symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded text-xs"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="italic">No symptoms recorded</span>
                )}
              </div>
            </div>

            {/* Vital Signs */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Vital Signs
              </h5>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div><strong>Heart Rate:</strong> {summary.vitals.heartRate || 'Not recorded'} bpm</div>
                <div><strong>Blood Pressure:</strong> {summary.vitals.bloodPressure || 'Not recorded'} mmHg</div>
                <div><strong>Temperature:</strong> {summary.vitals.temperature || 'Not recorded'}°C</div>
                <div><strong>Oxygen Sat:</strong> {summary.vitals.oxygenSaturation || 'Not recorded'}%</div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Medical History
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {summary.history ? (
                  <p className="leading-relaxed">{summary.history}</p>
                ) : (
                  <span className="italic">No medical history provided</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Step 4 of 4 - Ready to Submit</span>
            <div className="flex space-x-2">
              <div className="w-8 h-2 bg-purple-600 rounded-full"></div>
              <div className="w-8 h-2 bg-purple-600 rounded-full"></div>
              <div className="w-8 h-2 bg-purple-600 rounded-full"></div>
              <div className="w-8 h-2 bg-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Final Validation Warning */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Ready for AI Triage Analysis</p>
              <p>
                Please review the patient information above. Once submitted, the AI will analyze 
                the symptoms and vital signs to provide a triage recommendation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HistoryStep;
