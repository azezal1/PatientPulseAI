import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, RotateCcw, Send } from 'lucide-react';
import { useTranslation } from '../../i18n/translations';
import { patientAPI } from '../../utils/api';
import triageAI from '../../utils/triageAI';
import { getRandomDemoCase } from '../../utils/demoData';
import { calculateFeatureImportance } from '../../utils/featureImportance';

import BasicInfoStep from './BasicInfoStep';
import SymptomsStep from './SymptomsStep';
import VitalsStep from './VitalsStep';
import HistoryStep from './HistoryStep';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const STEPS = {
  BASIC: 0,
  SYMPTOMS: 1,
  VITALS: 2,
  HISTORY: 3
};

/**
 * Enhanced Multi-Step Form for patient intake
 * Reorganized with separate step components and improved UX
 */
const MultiStepForm = ({ language, onPrediction, onPatientAdded, setIsLoading }) => {
  const { t } = useTranslation(language);
  const [currentStep, setCurrentStep] = useState(STEPS.BASIC);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const [errors, setErrors] = useState({});

  const stepComponents = [
    BasicInfoStep,
    SymptomsStep,
    VitalsStep,
    HistoryStep
  ];

  const stepTitles = [
    'Basic Information',
    'Symptoms',
    'Vital Signs',
    'Medical History'
  ];

  const handleFormDataChange = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors when user makes changes
    const updatedErrors = { ...errors };
    Object.keys(updates).forEach(key => {
      if (key === 'vitals') {
        Object.keys(updates.vitals || {}).forEach(vitalKey => {
          delete updatedErrors[`vitals.${vitalKey}`];
        });
      } else {
        delete updatedErrors[key];
      }
    });
    setErrors(updatedErrors);
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case STEPS.BASIC:
        if (!formData.name.trim()) {
          newErrors.name = 'Patient name is required';
        }
        if (!formData.age || formData.age < 0 || formData.age > 150) {
          newErrors.age = 'Please enter a valid age (0-150)';
        }
        if (!formData.gender) {
          newErrors.gender = 'Gender selection is required';
        }
        break;

      case STEPS.SYMPTOMS:
        if (formData.symptoms.length === 0) {
          newErrors.symptoms = 'Please add at least one symptom';
        }
        break;

      case STEPS.VITALS:
        const vitals = formData.vitals;
        
        if (!vitals.heartRate || vitals.heartRate < 30 || vitals.heartRate > 200) {
          newErrors['vitals.heartRate'] = 'Heart rate must be between 30-200 bpm';
        }
        
        if (!vitals.bloodPressure || !/^\d{2,3}\/\d{2,3}$/.test(vitals.bloodPressure)) {
          newErrors['vitals.bloodPressure'] = 'Blood pressure format: 120/80';
        }
        
        if (!vitals.temperature || vitals.temperature < 30 || vitals.temperature > 45) {
          newErrors['vitals.temperature'] = 'Temperature must be between 30-45°C';
        }
        
        if (!vitals.oxygenSaturation || vitals.oxygenSaturation < 70 || vitals.oxygenSaturation > 100) {
          newErrors['vitals.oxygenSaturation'] = 'Oxygen saturation must be between 70-100%';
        }
        break;

      case STEPS.HISTORY:
        // Medical history is optional, no validation needed
        break;
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

  const loadDemoCase = () => {
    const demoCase = getRandomDemoCase();
    setFormData({
      name: demoCase.name,
      age: demoCase.age.toString(),
      gender: demoCase.gender,
      symptoms: demoCase.symptoms,
      vitals: {
        heartRate: demoCase.vitals.heartRate.toString(),
        bloodPressure: demoCase.vitals.bloodPressure,
        temperature: demoCase.vitals.temperature.toString(),
        oxygenSaturation: demoCase.vitals.oxygenSaturation.toString()
      },
      medicalHistory: demoCase.medicalHistory || ''
    });
    setErrors({});
  };

  const resetForm = () => {
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
    setCurrentStep(STEPS.BASIC);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Convert form data to proper types
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        vitals: {
          heartRate: parseInt(formData.vitals.heartRate),
          bloodPressure: formData.vitals.bloodPressure,
          temperature: parseFloat(formData.vitals.temperature),
          oxygenSaturation: parseInt(formData.vitals.oxygenSaturation)
        },
        timestamp: new Date().toISOString()
      };

      // Get AI prediction
      const prediction = await triageAI.predict(patientData);
      
      // Calculate feature importance
      const featureImportance = calculateFeatureImportance(patientData, prediction);

      // Add patient to database
      const savedPatient = await patientAPI.create({
        ...patientData,
        urgency: prediction.urgency,
        confidence: prediction.confidence
      });

      // Notify parent components
      onPrediction({ ...prediction, featureImportance }, savedPatient);
      onPatientAdded();

      // Reset form for next patient
      resetForm();

    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Failed to process patient. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = stepComponents[currentStep];
  const isLastStep = currentStep === STEPS.HISTORY;
  const isFirstStep = currentStep === STEPS.BASIC;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Patient Intake Form
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoCase}
              disabled={isSubmitting}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Demo Case
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center space-x-4">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                index <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index <= currentStep
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {title}
              </span>
              {index < stepTitles.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step */}
      <form onSubmit={handleSubmit}>
        <CurrentStepComponent
          formData={formData}
          onChange={handleFormDataChange}
          errors={errors}
          t={t}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={isFirstStep || isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {stepTitles.length}
          </div>

          {isLastStep ? (
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Submit for Triage
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              disabled={isSubmitting}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300" role="alert">
              {errors.submit}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default MultiStepForm;
