import { Activity, Heart, Thermometer, Gauge } from 'lucide-react';
import Input from '../common/Input';
import Card from '../common/Card';

/**
 * Vitals Step - Step 3 of patient intake
 * Collects vital signs with validation and normal range indicators
 */
const VitalsStep = ({ formData, onChange, errors, t }) => {
  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    const vitalName = name.split('.')[1];
    onChange({
      vitals: {
        ...formData.vitals,
        [vitalName]: value
      }
    });
  };

  const getVitalStatus = (vital, value) => {
    if (!value) return null;
    
    const ranges = {
      heartRate: { min: 60, max: 100, unit: 'bpm' },
      oxygenSaturation: { min: 95, max: 100, unit: '%' },
      temperature: { min: 36.1, max: 37.2, unit: '°C' },
      bloodPressure: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } }
    };

    if (vital === 'bloodPressure') {
      const [systolic, diastolic] = value.split('/').map(Number);
      if (isNaN(systolic) || isNaN(diastolic)) return null;
      
      const systolicStatus = systolic < ranges.bloodPressure.systolic.min || systolic > ranges.bloodPressure.systolic.max;
      const diastolicStatus = diastolic < ranges.bloodPressure.diastolic.min || diastolic > ranges.bloodPressure.diastolic.max;
      
      if (systolicStatus || diastolicStatus) {
        return { status: 'abnormal', color: 'text-red-600 dark:text-red-400' };
      }
      return { status: 'normal', color: 'text-green-600 dark:text-green-400' };
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    const range = ranges[vital];
    if (numValue < range.min || numValue > range.max) {
      return { status: 'abnormal', color: 'text-red-600 dark:text-red-400' };
    }
    return { status: 'normal', color: 'text-green-600 dark:text-green-400' };
  };

  const vitals = [
    {
      name: 'heartRate',
      label: 'Heart Rate',
      icon: Heart,
      placeholder: 'e.g., 72',
      unit: 'bpm',
      normalRange: '60-100 bpm',
      type: 'number',
      min: 30,
      max: 200
    },
    {
      name: 'bloodPressure',
      label: 'Blood Pressure',
      icon: Gauge,
      placeholder: 'e.g., 120/80',
      unit: 'mmHg',
      normalRange: '90/60 - 140/90 mmHg',
      type: 'text',
      pattern: '^[0-9]{2,3}/[0-9]{2,3}$'
    },
    {
      name: 'temperature',
      label: 'Temperature',
      icon: Thermometer,
      placeholder: 'e.g., 37.0',
      unit: '°C',
      normalRange: '36.1-37.2°C',
      type: 'number',
      min: 30,
      max: 45,
      step: 0.1
    },
    {
      name: 'oxygenSaturation',
      label: 'Oxygen Saturation',
      icon: Activity,
      placeholder: 'e.g., 98',
      unit: '%',
      normalRange: '95-100%',
      type: 'number',
      min: 70,
      max: 100
    }
  ];

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('form.step3.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('form.step3.description')}
          </p>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vitals.map((vital) => {
            const Icon = vital.icon;
            const status = getVitalStatus(vital.name, formData.vitals[vital.name]);
            
            return (
              <div key={vital.name} className="space-y-3">
                {/* Vital Input */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{vital.label}</span>
                      <span className="text-red-500" aria-label="required">*</span>
                    </div>
                  </label>
                  
                  <div className="relative">
                    <input
                      type={vital.type}
                      name={`vitals.${vital.name}`}
                      value={formData.vitals[vital.name]}
                      onChange={handleVitalChange}
                      placeholder={vital.placeholder}
                      min={vital.min}
                      max={vital.max}
                      step={vital.step}
                      pattern={vital.pattern}
                      className={`block w-full px-4 py-3 pr-12 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        errors[`vitals.${vital.name}`]
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : status?.status === 'abnormal'
                          ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-500'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                      required
                    />
                    
                    {/* Unit indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                      {vital.unit}
                    </div>
                  </div>
                  
                  {errors[`vitals.${vital.name}`] && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                      {errors[`vitals.${vital.name}`]}
                    </p>
                  )}
                </div>

                {/* Normal Range & Status */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Normal: {vital.normalRange}
                    </span>
                    {status && (
                      <span className={`font-semibold ${status.color}`}>
                        {status.status === 'normal' ? '✓ Normal' : '⚠ Abnormal'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Reference Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Quick Reference - Normal Vital Signs
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
            <div>• Heart Rate: 60-100 bpm</div>
            <div>• Blood Pressure: 90/60 - 140/90 mmHg</div>
            <div>• Temperature: 36.1-37.2°C</div>
            <div>• Oxygen Saturation: 95-100%</div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Step 3 of 4</span>
            <div className="flex space-x-2">
              <div className="w-8 h-2 bg-red-600 rounded-full"></div>
              <div className="w-8 h-2 bg-red-600 rounded-full"></div>
              <div className="w-8 h-2 bg-red-600 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        {Object.keys(errors).some(key => key.startsWith('vitals.')) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
              Please correct the vital signs errors:
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(errors)
                .filter(([key]) => key.startsWith('vitals.'))
                .map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VitalsStep;
