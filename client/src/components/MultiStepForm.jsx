import { useState } from 'react';
import { User, Heart, AlertTriangle, FileText, ChevronRight, ChevronLeft, Check, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const translations = {
  en: {
    steps: ['Patient Info', 'Symptoms', 'Vital Signs', 'Medical History'],
    patientInfo: 'Patient Information',
    name: 'Full Name',
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    symptoms: 'Symptoms',
    vitals: 'Vital Signs',
    heartRate: 'Heart Rate (bpm)',
    bloodPressure: 'Blood Pressure (e.g., 120/80)',
    temperature: 'Temperature (°C)',
    oxygenSaturation: 'Oxygen Saturation (%)',
    medicalHistory: 'Medical History',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit & Get AI Prediction',
    required: 'This field is required'
  },
  hi: {
    steps: ['मरीज़ की जानकारी', 'लक्षण', 'जीवन संकेत', 'चिकित्सा इतिहास'],
    patientInfo: 'मरीज़ की जानकारी',
    name: 'पूरा नाम',
    age: 'उम्र',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    symptoms: 'लक्षण',
    vitals: 'जीवन संकेत',
    heartRate: 'हृदय गति (bpm)',
    bloodPressure: 'रक्तचाप (जैसे 120/80)',
    temperature: 'तापमान (°C)',
    oxygenSaturation: 'ऑक्सीजन संतृप्ति (%)',
    medicalHistory: 'चिकित्सा इतिहास',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें और AI भविष्यवाणी प्राप्त करें',
    required: 'यह फ़ील्ड आवश्यक है'
  },
  ta: {
    steps: ['நோயாளி தகவல்', 'அறிகுறிகள்', 'உயிர் அறிகுறிகள்', 'மருத்துவ வரலாறு'],
    patientInfo: 'நோயாளி தகவல்',
    name: 'முழு பெயர்',
    age: 'வயது',
    gender: 'பாலினம்',
    male: 'ஆண்',
    female: 'பெண்',
    other: 'மற்றவை',
    symptoms: 'அறிகுறிகள்',
    vitals: 'உயிர் அறிகுறிகள்',
    heartRate: 'இதய துடிப்பு (bpm)',
    bloodPressure: 'இரத்த அழுத்தம் (உதா: 120/80)',
    temperature: 'வெப்பநிலை (°C)',
    oxygenSaturation: 'ஆக்ஸிஜன் செறிவு (%)',
    medicalHistory: 'மருத்துவ வரலாறு',
    next: 'அடுத்து',
    previous: 'முந்தைய',
    submit: 'சமர்ப்பிக்கவும் மற்றும் AI கணிப்பு பெறவும்',
    required: 'இந்த புலம் தேவை'
  }
};

const commonSymptoms = [
  'Chest Pain', 'Difficulty Breathing', 'Severe Headache', 'Abdominal Pain',
  'Fever', 'Nausea', 'Dizziness', 'Fatigue', 'Cough', 'Sore Throat'
];

const MultiStepForm = ({ language = 'en', onPatientAdded, onPredictionView }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      age: '',
      gender: 'male',
      heartRate: '',
      bloodPressure: '',
      temperature: '',
      oxygenSaturation: '',
      medicalHistory: ''
    }
  });

  const t = translations[language] || translations.en;

  const addSymptom = () => {
    if (newSymptom.trim() && !symptoms.includes(newSymptom.trim())) {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const patientData = {
        ...data,
        age: parseInt(data.age),
        symptoms,
        vitals: {
          heartRate: parseInt(data.heartRate),
          bloodPressure: data.bloodPressure,
          temperature: parseFloat(data.temperature),
          oxygenSaturation: parseInt(data.oxygenSaturation)
        }
      };

      const response = await axios.post(`${API_BASE}/patients`, patientData);
      
      toast.success('Patient registered successfully!');
      
      if (response.data.urgency && onPredictionView) {
        onPredictionView({
          urgency: response.data.urgency,
          confidence: response.data.confidence,
          reasoning: response.data.reasoning || 'AI assessment completed',
          factors: response.data.factors || [],
          recommendations: response.data.recommendations || []
        });
      }

      reset();
      setSymptoms([]);
      setCurrentStep(0);
      
      if (onPatientAdded) {
        onPatientAdded();
      }
    } catch (error) {
      console.error('Error submitting patient:', error);
      toast.error('Failed to register patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {t.steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
              }`}>
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              {index < t.steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {t.steps[currentStep]}
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 0: Patient Information */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.name} *
                  </label>
                  <input
                    {...register('name', { required: t.required })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.age} *
                  </label>
                  <input
                    {...register('age', { 
                      required: t.required,
                      min: { value: 1, message: 'Age must be at least 1' },
                      max: { value: 120, message: 'Age must be less than 120' }
                    })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter age"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.gender} *
                  </label>
                  <select
                    {...register('gender', { required: t.required })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Symptoms */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter symptom..."
                  />
                  <button
                    type="button"
                    onClick={addSymptom}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => {
                        if (!symptoms.includes(symptom)) {
                          setSymptoms([...symptoms, symptom]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        symptoms.includes(symptom)
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>

                {symptoms.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">Selected Symptoms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom) => (
                        <div
                          key={symptom}
                          className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm">{symptom}</span>
                          <button
                            type="button"
                            onClick={() => removeSymptom(symptom)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Vital Signs */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.heartRate} *
                  </label>
                  <input
                    {...register('heartRate', { 
                      required: t.required,
                      min: { value: 30, message: 'Heart rate must be at least 30' },
                      max: { value: 250, message: 'Heart rate must be less than 250' }
                    })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 72"
                  />
                  {errors.heartRate && (
                    <p className="mt-1 text-sm text-red-600">{errors.heartRate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.bloodPressure} *
                  </label>
                  <input
                    {...register('bloodPressure', { required: t.required })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="120/80"
                  />
                  {errors.bloodPressure && (
                    <p className="mt-1 text-sm text-red-600">{errors.bloodPressure.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.temperature} *
                  </label>
                  <input
                    {...register('temperature', { 
                      required: t.required,
                      min: { value: 35, message: 'Temperature must be at least 35°C' },
                      max: { value: 45, message: 'Temperature must be less than 45°C' }
                    })}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="37.0"
                  />
                  {errors.temperature && (
                    <p className="mt-1 text-sm text-red-600">{errors.temperature.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.oxygenSaturation} *
                  </label>
                  <input
                    {...register('oxygenSaturation', { 
                      required: t.required,
                      min: { value: 70, message: 'Oxygen saturation must be at least 70%' },
                      max: { value: 100, message: 'Oxygen saturation cannot exceed 100%' }
                    })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="98"
                  />
                  {errors.oxygenSaturation && (
                    <p className="mt-1 text-sm text-red-600">{errors.oxygenSaturation.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Medical History */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.medicalHistory}
                </label>
                <textarea
                  {...register('medicalHistory')}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Any allergies, current medications, medical conditions, previous surgeries..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{t.previous}</span>
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{t.next}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{t.submit}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MultiStepForm;
