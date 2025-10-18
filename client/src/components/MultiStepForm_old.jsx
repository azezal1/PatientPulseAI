import { useState, useRef } from 'react';
import { User, Calendar, Stethoscope, Activity, FileText, Sparkles, RotateCcw, TestTube, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from '../i18n/translations';
import { patientAPI } from '../utils/api';
import triageAI from '../utils/triageAI';
import { getRandomDemoCase } from '../utils/demoData';
import { calculateFeatureImportance } from '../utils/featureImportance';

const STEPS = {
  BASIC: 0,
  SYMPTOMS: 1,
  VITALS: 2,
  HISTORY: 3
};

const MultiStepForm = ({ language, onPrediction, onPatientAdded, setIsLoading }) => {
  const { t } = useTranslation(language);
  const [currentStep, setCurrentStep] = useState(STEPS.BASIC);
  
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

  const validateStep = (step) => {
    const newErrors = {};

    if (step === STEPS.BASIC) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.age || formData.age < 1 || formData.age > 120) {
        newErrors.age = 'Valid age is required (1-120)';
      }
    }

    if (step === STEPS.SYMPTOMS) {
      if (formData.symptoms.length === 0) {
        newErrors.symptoms = 'At least one symptom is required';
      }
    }

    if (step === STEPS.VITALS) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.HISTORY));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, STEPS.BASIC));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      // Get AI prediction
      const prediction = await triageAI.predict(formData);
      
      // Calculate feature importance
      const featureImportance = calculateFeatureImportance(formData);
      
      // Create patient record
      const patientData = {
        ...formData,
        urgency: prediction.urgency,
        confidence: prediction.confidence
      };

      await patientAPI.create(patientData);
      
      onPrediction({ ...prediction, featureImportance }, patientData);
      onPatientAdded();

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
    setCurrentStep(STEPS.BASIC);
    setErrors({});
    onPrediction(null);
  };

  const loadDemoCase = () => {
    const demoCase = getRandomDemoCase();
    setFormData(demoCase);
    setErrors({});
  };

  const stepConfig = [
    { key: STEPS.BASIC, label: 'Basic Info', icon: User },
    { key: STEPS.SYMPTOMS, label: 'Symptoms', icon: Stethoscope },
    { key: STEPS.VITALS, label: 'Vitals', icon: Activity },
    { key: STEPS.HISTORY, label: 'History', icon: FileText }
  ];

  return (
    <div className="card p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('form.title')}</h2>
        <button
          onClick={loadDemoCase}
          className="flex items-center space-x-2 text-sm bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg transition-colors duration-200"
          title="Load demo case (Ctrl+D)"
        >
          <TestTube className="w-4 h-4" />
          <span>{t('form.loadDemo')}</span>
        </button>
      </div>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepConfig.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = currentStep > step.key;
            
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-600 text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 font-semibold ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < stepConfig.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-all duration-200 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Info */}
        {currentStep === STEPS.BASIC && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4" />
                <span>{t('form.name')}</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('form.namePlaceholder')}
                className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
                autoFocus
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{t('form.age')}</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder={t('form.agePlaceholder')}
                  className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.age ? 'border-red-500' : ''}`}
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4" />
                  <span>{t('form.gender')}</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Male">{t('form.male')}</option>
                  <option value="Female">{t('form.female')}</option>
                  <option value="Other">{t('form.other')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Symptoms */}
        {currentStep === STEPS.SYMPTOMS && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                  className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.symptoms ? 'border-red-500' : ''}`}
                  autoFocus
                />
                {showSymptomSuggestions && filteredSymptoms.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSymptoms.slice(0, 10).map((symptom, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addSymptom(symptom)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 dark:text-white transition-colors duration-150"
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.symptoms && <p className="text-red-500 text-xs mt-1">{errors.symptoms}</p>}
              
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{symptom}</span>
                    <button
                      type="button"
                      onClick={() => removeSymptom(symptom)}
                      className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Vitals */}
        {currentStep === STEPS.VITALS && (
          <div className="space-y-4 animate-fade-in">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <Activity className="w-4 h-4" />
              <span>{t('form.vitals')}</span>
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('form.heartRate')}</label>
                <input
                  type="number"
                  name="vitals.heartRate"
                  value={formData.vitals.heartRate}
                  onChange={handleInputChange}
                  placeholder={t('form.heartRatePlaceholder')}
                  className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.heartRate ? 'border-red-500' : ''}`}
                  autoFocus
                />
                {errors.heartRate && <p className="text-red-500 text-xs mt-1">{errors.heartRate}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('form.bloodPressure')}</label>
                <input
                  type="text"
                  name="vitals.bloodPressure"
                  value={formData.vitals.bloodPressure}
                  onChange={handleInputChange}
                  placeholder={t('form.bloodPressurePlaceholder')}
                  className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.bloodPressure ? 'border-red-500' : ''}`}
                />
                {errors.bloodPressure && <p className="text-red-500 text-xs mt-1">{errors.bloodPressure}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('form.temperature')}</label>
                <input
                  type="number"
                  step="0.1"
                  name="vitals.temperature"
                  value={formData.vitals.temperature}
                  onChange={handleInputChange}
                  placeholder={t('form.temperaturePlaceholder')}
                  className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.temperature ? 'border-red-500' : ''}`}
                />
                {errors.temperature && <p className="text-red-500 text-xs mt-1">{errors.temperature}</p>}
              </div>

              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('form.oxygenSaturation')}</label>
                <input
                  type="number"
                  name="vitals.oxygenSaturation"
                  value={formData.vitals.oxygenSaturation}
                  onChange={handleInputChange}
                  placeholder={t('form.oxygenSaturationPlaceholder')}
                  className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.oxygenSaturation ? 'border-red-500' : ''}`}
                />
                {errors.oxygenSaturation && <p className="text-red-500 text-xs mt-1">{errors.oxygenSaturation}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Medical History */}
        {currentStep === STEPS.HISTORY && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4" />
                <span>{t('form.medicalHistory')}</span>
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleInputChange}
                placeholder={t('form.medicalHistoryPlaceholder')}
                rows={5}
                className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <div className="flex space-x-2">
            {currentStep > STEPS.BASIC && (
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('form.reset')}</span>
            </button>

            {currentStep < STEPS.HISTORY ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{t('form.submit')}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MultiStepForm;
