/**
 * Calculate feature importance for triage predictions
 * Shows which vitals/symptoms contributed most to the prediction
 */

export const calculateFeatureImportance = (patientData) => {
  const features = [];
  
  const { age, symptoms, vitals, medicalHistory } = patientData;
  const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);

  // Age importance
  if (age > 65 || age < 5) {
    features.push({
      name: 'Age',
      value: age > 65 ? Math.min((age - 65) * 2, 100) : Math.min((5 - age) * 20, 100),
      reason: age > 65 ? 'Elderly patient (high risk)' : 'Pediatric patient (high risk)',
      category: 'demographic'
    });
  }

  // Heart Rate
  const hrDeviation = Math.abs(vitals.heartRate - 75);
  if (hrDeviation > 25) {
    features.push({
      name: 'Heart Rate',
      value: Math.min(hrDeviation * 2, 100),
      reason: vitals.heartRate > 100 ? 'Tachycardia detected' : 'Bradycardia detected',
      category: 'vital'
    });
  }

  // Blood Pressure
  if (systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60) {
    const bpScore = Math.max(
      Math.abs(systolic - 120) / 2,
      Math.abs(diastolic - 80)
    );
    features.push({
      name: 'Blood Pressure',
      value: Math.min(bpScore, 100),
      reason: systolic > 140 ? 'Hypertension' : systolic < 90 ? 'Hypotension' : 'Abnormal diastolic',
      category: 'vital'
    });
  }

  // Oxygen Saturation
  if (vitals.oxygenSaturation < 95) {
    features.push({
      name: 'Oxygen Saturation',
      value: Math.min((95 - vitals.oxygenSaturation) * 5, 100),
      reason: vitals.oxygenSaturation < 90 ? 'Critical hypoxemia' : 'Low oxygen levels',
      category: 'vital'
    });
  }

  // Temperature
  if (vitals.temperature > 38 || vitals.temperature < 36) {
    features.push({
      name: 'Temperature',
      value: Math.min(Math.abs(vitals.temperature - 37) * 20, 100),
      reason: vitals.temperature > 38 ? 'Fever detected' : 'Hypothermia risk',
      category: 'vital'
    });
  }

  // Critical Symptoms
  const criticalSymptoms = [
    'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious',
    'seizure', 'severe allergic reaction', 'stroke'
  ];
  
  const urgentSymptoms = [
    'severe headache', 'abdominal pain', 'vomiting', 'fracture'
  ];

  symptoms.forEach(symptom => {
    const symptomLower = symptom.toLowerCase();
    
    if (criticalSymptoms.some(cs => symptomLower.includes(cs))) {
      features.push({
        name: symptom,
        value: 95,
        reason: 'Life-threatening symptom',
        category: 'symptom'
      });
    } else if (urgentSymptoms.some(us => symptomLower.includes(us))) {
      features.push({
        name: symptom,
        value: 70,
        reason: 'Urgent medical attention required',
        category: 'symptom'
      });
    }
  });

  // Medical History
  const criticalConditions = ['heart disease', 'diabetes', 'asthma', 'copd', 'cancer'];
  if (medicalHistory && medicalHistory !== 'None') {
    const hasCondition = criticalConditions.some(condition =>
      medicalHistory.toLowerCase().includes(condition)
    );
    
    if (hasCondition) {
      features.push({
        name: 'Medical History',
        value: 60,
        reason: 'Pre-existing critical condition',
        category: 'history'
      });
    }
  }

  // Sort by importance
  features.sort((a, b) => b.value - a.value);

  return features.slice(0, 5); // Top 5 features
};

export const getCategoryColor = (category) => {
  const colors = {
    vital: 'text-red-600 dark:text-red-400',
    symptom: 'text-orange-600 dark:text-orange-400',
    demographic: 'text-blue-600 dark:text-blue-400',
    history: 'text-purple-600 dark:text-purple-400'
  };
  return colors[category] || 'text-gray-600 dark:text-gray-400';
};
