import { useState, useRef } from 'react';
import { Stethoscope, Plus, X, Search } from 'lucide-react';
import Input from '../common/Input';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * Symptoms Step - Step 2 of patient intake
 * Collects patient symptoms with autocomplete functionality
 */
const SymptomsStep = ({ formData, onChange, errors, t }) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const symptoms = t('symptoms');

  const filteredSymptoms = symptoms.filter(symptom =>
    symptom.toLowerCase().includes(symptomInput.toLowerCase()) &&
    !formData.symptoms.includes(symptom)
  );

  const addSymptom = (symptom) => {
    if (!formData.symptoms.includes(symptom)) {
      onChange({ symptoms: [...formData.symptoms, symptom] });
      setSymptomInput('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeSymptom = (symptomToRemove) => {
    onChange({ 
      symptoms: formData.symptoms.filter(s => s !== symptomToRemove) 
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSymptomInput(value);
    setShowSuggestions(value.length > 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && symptomInput.trim()) {
      e.preventDefault();
      if (filteredSymptoms.length > 0) {
        addSymptom(filteredSymptoms[0]);
      } else if (symptomInput.trim()) {
        addSymptom(symptomInput.trim());
      }
    }
  };

  const commonSymptoms = [
    'Chest Pain', 'Difficulty Breathing', 'Fever', 'Headache', 
    'Nausea', 'Dizziness', 'Abdominal Pain', 'Fatigue'
  ];

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('form.step2.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('form.step2.description')}
          </p>
        </div>

        {/* Symptom Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={symptomInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(symptomInput.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Type symptoms or select from suggestions..."
              className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 transition-colors duration-200"
              autoFocus
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSymptoms.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredSymptoms.slice(0, 8).map((symptom, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addSymptom(symptom)}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-green-500" />
                    <span className="text-gray-800 dark:text-white">{symptom}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Common Symptoms */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Common Symptoms (Click to add)
          </h4>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms
              .filter(symptom => !formData.symptoms.includes(symptom))
              .map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => addSymptom(symptom)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{symptom}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Selected Symptoms */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Selected Symptoms ({formData.symptoms.length})
          </h4>
          
          {formData.symptoms.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No symptoms added yet</p>
              <p className="text-sm">Start typing or select from common symptoms above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.symptoms.map((symptom, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
                >
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    {symptom}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSymptom(symptom)}
                    className="p-1 text-green-600 hover:text-red-600 dark:text-green-400 dark:hover:text-red-400 transition-colors"
                    aria-label={`Remove ${symptom}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Step 2 of 4</span>
            <div className="flex space-x-2">
              <div className="w-8 h-2 bg-green-600 rounded-full"></div>
              <div className="w-8 h-2 bg-green-600 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Validation */}
        {errors.symptoms && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300" role="alert">
              {errors.symptoms}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SymptomsStep;
