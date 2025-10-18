import { useState, useRef, useEffect } from 'react';
import { User, Calendar, Stethoscope, Activity, FileText, Sparkles, RotateCcw, TestTube } from 'lucide-react';
import { useTranslation } from '../i18n/translations';
import { patientAPI } from '../utils/api';
import triageAI from '../utils/triageAI';
import { getRandomDemoCase } from '../utils/demoData';

const TriageForm = ({ language, onPrediction, onPatientAdded, setIsLoading }) => {
  const { t } = useTranslation(language);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    symptoms: [],
    vitals: {
      heartRate: '',
      bloodPressure: '',
      temperature: '',
      oxygenSaturation: ''
    },
    medicalHistory: ''
  });

  const [symptomInput, setSymptomInput] = useState('');
  const [showSymptomSuggestions, setShowSymptomSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const symptomInputRef = useRef(null);

  const symptoms = t('symptoms');

  // Filter symptoms based on input
  const filteredSymptoms = symptoms.filter(symptom =>
    symptom.toLowerCase().includes(symptomInput.toLowerCase()) &&
    !formData.symptoms.includes(symptom)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vitals.')) {
      const vitalName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [vitalName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const addSymptom = (symptom) => {
    if (symptom && !formData.symptoms.includes(symptom)) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptom]
      }));
      setSymptomInput('');
      setShowSymptomSuggestions(false);
    }
  };

  const removeSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const handleSymptomKeyDown = (e) => {
    if (e.key === 'Enter' && symptomInput.trim()) {
      e.preventDefault();
      addSymptom(symptomInput.trim());
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Valid age is required (1-120)';
    }

    if (formData.symptoms.length === 0) {
      newErrors.symptoms = 'At least one symptom is required';
    }

    if (!formData.vitals.heartRate || formData.vitals.heartRate < 30 || formData.vitals.heartRate > 250) {
      newErrors.heartRate = 'Valid heart rate required (30-250)';
    }

    if (!formData.vitals.bloodPressure || !/^\d{2,3}\/\d{2,3}$/.test(formData.vitals.bloodPressure)) {
      newErrors.bloodPressure = 'Valid BP required (e.g., 120/80)';
    }

    if (!formData.vitals.temperature || formData.vitals.temperature < 30 || formData.vitals.temperature > 45) {
      newErrors.temperature = 'Valid temperature required (30-45°C)';
    }

    if (!formData.vitals.oxygenSaturation || formData.vitals.oxygenSaturation < 50 || formData.vitals.oxygenSaturation > 100) {
      newErrors.oxygenSaturation = 'Valid O2 saturation required (50-100%)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get AI prediction using TensorFlow.js
      const prediction = await triageAI.predict(formData);
      
      // Create patient record with prediction
      const patientData = {
        ...formData,
        urgency: prediction.urgency,
        confidence: prediction.confidence
      };

      const newPatient = await patientAPI.create(patientData);
      
      onPrediction(prediction);
      onPatientAdded();

      // Show success notification
      alert(t('notifications.patientAdded'));
    } catch (error) {
      console.error('Error:', error);
      alert(t('notifications.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      symptoms: [],
      vitals: {
        heartRate: '',
        bloodPressure: '',
        temperature: '',
        oxygenSaturation: ''
      },
      medicalHistory: ''
    });
    setErrors({});
    onPrediction(null);
  };

  const loadDemoCase = () => {
    const demoCase = getRandomDemoCase();
    setFormData(demoCase);
    setErrors({});
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('form.title')}</h2>
        <button
          onClick={loadDemoCase}
          className="flex items-center space-x-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg transition-colors duration-200"
        >
          <TestTube className="w-4 h-4" />
          <span>{t('form.loadDemo')}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <User className="w-4 h-4" />
            <span>{t('form.name')}</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={t('form.namePlaceholder')}
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{t('form.age')}</span>
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder={t('form.agePlaceholder')}
              className={`input-field ${errors.age ? 'border-red-500' : ''}`}
            />
            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4" />
              <span>{t('form.gender')}</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="Male">{t('form.male')}</option>
              <option value="Female">{t('form.female')}</option>
              <option value="Other">{t('form.other')}</option>
            </select>
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <Stethoscope className="w-4 h-4" />
            <span>{t('form.symptoms')}</span>
          </label>
          <div className="relative">
            <input
              ref={symptomInputRef}
              type="text"
              value={symptomInput}
              onChange={(e) => {
                setSymptomInput(e.target.value);
                setShowSymptomSuggestions(true);
              }}
              onKeyDown={handleSymptomKeyDown}
              onFocus={() => setShowSymptomSuggestions(true)}
              placeholder={t('form.symptomsPlaceholder')}
              className={`input-field ${errors.symptoms ? 'border-red-500' : ''}`}
            />
            {showSymptomSuggestions && filteredSymptoms.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSymptoms.slice(0, 10).map((symptom, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addSymptom(symptom)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors duration-150"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.symptoms && <p className="text-red-500 text-xs mt-1">{errors.symptoms}</p>}
          
          {/* Selected Symptoms */}
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.symptoms.map((symptom, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{symptom}</span>
                <button
                  type="button"
                  onClick={() => removeSymptom(symptom)}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Vitals */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
            <Activity className="w-4 h-4" />
            <span>{t('form.vitals')}</span>
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">{t('form.heartRate')}</label>
              <input
                type="number"
                name="vitals.heartRate"
                value={formData.vitals.heartRate}
                onChange={handleInputChange}
                placeholder={t('form.heartRatePlaceholder')}
                className={`input-field ${errors.heartRate ? 'border-red-500' : ''}`}
              />
              {errors.heartRate && <p className="text-red-500 text-xs mt-1">{errors.heartRate}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">{t('form.bloodPressure')}</label>
              <input
                type="text"
                name="vitals.bloodPressure"
                value={formData.vitals.bloodPressure}
                onChange={handleInputChange}
                placeholder={t('form.bloodPressurePlaceholder')}
                className={`input-field ${errors.bloodPressure ? 'border-red-500' : ''}`}
              />
              {errors.bloodPressure && <p className="text-red-500 text-xs mt-1">{errors.bloodPressure}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">{t('form.temperature')}</label>
              <input
                type="number"
                step="0.1"
                name="vitals.temperature"
                value={formData.vitals.temperature}
                onChange={handleInputChange}
                placeholder={t('form.temperaturePlaceholder')}
                className={`input-field ${errors.temperature ? 'border-red-500' : ''}`}
              />
              {errors.temperature && <p className="text-red-500 text-xs mt-1">{errors.temperature}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">{t('form.oxygenSaturation')}</label>
              <input
                type="number"
                name="vitals.oxygenSaturation"
                value={formData.vitals.oxygenSaturation}
                onChange={handleInputChange}
                placeholder={t('form.oxygenSaturationPlaceholder')}
                className={`input-field ${errors.oxygenSaturation ? 'border-red-500' : ''}`}
              />
              {errors.oxygenSaturation && <p className="text-red-500 text-xs mt-1">{errors.oxygenSaturation}</p>}
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            <span>{t('form.medicalHistory')}</span>
          </label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleInputChange}
            placeholder={t('form.medicalHistoryPlaceholder')}
            rows={3}
            className="input-field"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{t('form.submit')}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('form.reset')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TriageForm;
