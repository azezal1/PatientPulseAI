/**
 * AI Triage Model - Server-side prediction logic
 * This provides a backup for the TensorFlow.js model
 * Uses rule-based logic combined with weighted scoring
 */

const CRITICAL_SYMPTOMS = [
  'Chest Pain',
  'Difficulty Breathing',
  'Severe Bleeding',
  'Unconscious',
  'Seizure',
  'Severe Allergic Reaction',
  'Stroke Symptoms',
  'Severe Head Injury',
  'Cardiac Arrest'
];

const URGENT_SYMPTOMS = [
  'Severe Headache',
  'Abdominal Pain',
  'High Fever',
  'Vomiting',
  'Fracture',
  'Deep Cut',
  'Severe Burns',
  'Poisoning'
];

function predictTriage(patientData) {
  const { age, symptoms, vitals, medicalHistory } = patientData;
  
  let score = 0;
  let factors = [];
  let detailedAnalysis = {
    symptoms: { score: 0, factors: [] },
    vitals: { score: 0, factors: [] },
    demographics: { score: 0, factors: [] },
    history: { score: 0, factors: [] }
  };

  // Enhanced symptom analysis
  const criticalSymptoms = [];
  const urgentSymptoms = [];
  
  symptoms.forEach(symptom => {
    const lowerSymptom = symptom.toLowerCase();
    
    // Check for critical symptoms
    const criticalMatch = CRITICAL_SYMPTOMS.find(critical => 
      lowerSymptom.includes(critical.toLowerCase())
    );
    if (criticalMatch) {
      criticalSymptoms.push(criticalMatch);
      score += 40;
      detailedAnalysis.symptoms.score += 40;
      detailedAnalysis.symptoms.factors.push({
        factor: criticalMatch,
        impact: 'High',
        weight: 40,
        description: `Critical symptom: ${criticalMatch}`
      });
    }
    
    // Check for urgent symptoms
    const urgentMatch = URGENT_SYMPTOMS.find(urgent => 
      lowerSymptom.includes(urgent.toLowerCase())
    );
    if (urgentMatch && !criticalMatch) {
      urgentSymptoms.push(urgentMatch);
      score += 20;
      detailedAnalysis.symptoms.score += 20;
      detailedAnalysis.symptoms.factors.push({
        factor: urgentMatch,
        impact: 'Medium',
        weight: 20,
        description: `Urgent symptom: ${urgentMatch}`
      });
    }
  });

  if (criticalSymptoms.length === 0 && urgentSymptoms.length === 0) {
    score += 5;
    detailedAnalysis.symptoms.score += 5;
    detailedAnalysis.symptoms.factors.push({
      factor: 'Minor Symptoms',
      impact: 'Low',
      weight: 5,
      description: 'No critical or urgent symptoms identified'
    });
  }

  // Enhanced vital signs analysis
  const vitalChecks = [
    {
      name: 'Heart Rate',
      value: vitals.heartRate,
      normal: { min: 60, max: 100 },
      critical: { min: 40, max: 150 },
      weight: { abnormal: 15, critical: 25 }
    },
    {
      name: 'Oxygen Saturation',
      value: vitals.oxygenSaturation,
      normal: { min: 95, max: 100 },
      critical: { min: 85, max: 100 },
      weight: { abnormal: 20, critical: 35 }
    },
    {
      name: 'Temperature',
      value: vitals.temperature,
      normal: { min: 36.1, max: 37.2 },
      critical: { min: 32, max: 42 },
      weight: { abnormal: 10, critical: 20 }
    }
  ];

  vitalChecks.forEach(vital => {
    const { name, value, normal, critical, weight } = vital;
    
    if (value < critical.min || value > critical.max) {
      score += weight.critical;
      detailedAnalysis.vitals.score += weight.critical;
      detailedAnalysis.vitals.factors.push({
        factor: name,
        impact: 'Critical',
        weight: weight.critical,
        description: `Critical ${name.toLowerCase()}: ${value} (normal: ${normal.min}-${normal.max})`
      });
    } else if (value < normal.min || value > normal.max) {
      score += weight.abnormal;
      detailedAnalysis.vitals.score += weight.abnormal;
      detailedAnalysis.vitals.factors.push({
        factor: name,
        impact: 'Medium',
        weight: weight.abnormal,
        description: `Abnormal ${name.toLowerCase()}: ${value} (normal: ${normal.min}-${normal.max})`
      });
    }
  });

  // Blood pressure analysis
  const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
  if (systolic > 180 || systolic < 70 || diastolic > 110 || diastolic < 40) {
    score += 25;
    detailedAnalysis.vitals.score += 25;
    detailedAnalysis.vitals.factors.push({
      factor: 'Blood Pressure',
      impact: 'Critical',
      weight: 25,
      description: `Critical blood pressure: ${systolic}/${diastolic} mmHg`
    });
  } else if (systolic > 160 || systolic < 90 || diastolic > 100 || diastolic < 60) {
    score += 15;
    detailedAnalysis.vitals.score += 15;
    detailedAnalysis.vitals.factors.push({
      factor: 'Blood Pressure',
      impact: 'Medium',
      weight: 15,
      description: `Elevated blood pressure: ${systolic}/${diastolic} mmHg`
    });
  }

  // Enhanced age analysis
  let ageRisk = 0;
  let ageDescription = '';
  
  if (age < 1) {
    ageRisk = 20;
    ageDescription = 'Infant - high vulnerability';
  } else if (age < 5) {
    ageRisk = 15;
    ageDescription = 'Young child - increased risk';
  } else if (age > 80) {
    ageRisk = 20;
    ageDescription = 'Elderly - high vulnerability';
  } else if (age > 65) {
    ageRisk = 10;
    ageDescription = 'Senior - moderate risk';
  }

  if (ageRisk > 0) {
    score += ageRisk;
    detailedAnalysis.demographics.score += ageRisk;
    detailedAnalysis.demographics.factors.push({
      factor: 'Age',
      impact: ageRisk > 15 ? 'High' : 'Medium',
      weight: ageRisk,
      description: ageDescription
    });
  }

  // Enhanced medical history analysis
  const criticalConditions = {
    'heart disease': { weight: 15, description: 'Cardiovascular risk factor' },
    'diabetes': { weight: 10, description: 'Metabolic disorder complication risk' },
    'asthma': { weight: 12, description: 'Respiratory condition risk' },
    'copd': { weight: 15, description: 'Chronic respiratory disease' },
    'cancer': { weight: 20, description: 'Oncological condition' },
    'kidney disease': { weight: 15, description: 'Renal function impairment' },
    'stroke': { weight: 18, description: 'Previous cerebrovascular event' },
    'seizure': { weight: 12, description: 'Neurological disorder' }
  };
  
  Object.entries(criticalConditions).forEach(([condition, config]) => {
    if (medicalHistory.toLowerCase().includes(condition)) {
      score += config.weight;
      detailedAnalysis.history.score += config.weight;
      detailedAnalysis.history.factors.push({
        factor: condition.charAt(0).toUpperCase() + condition.slice(1),
        impact: config.weight > 15 ? 'High' : 'Medium',
        weight: config.weight,
        description: config.description
      });
    }
  });

  // Compile all factors for explainability
  factors = [
    ...detailedAnalysis.symptoms.factors,
    ...detailedAnalysis.vitals.factors,
    ...detailedAnalysis.demographics.factors,
    ...detailedAnalysis.history.factors
  ].sort((a, b) => b.weight - a.weight);

  // Enhanced urgency determination with confidence calculation
  let urgency, confidence, riskLevel;
  const maxPossibleScore = 200; // Theoretical maximum
  const normalizedScore = (score / maxPossibleScore) * 100;

  if (score >= 60 || criticalSymptoms.length > 0) {
    urgency = 'Critical';
    riskLevel = 'Immediate';
    confidence = Math.min(90 + (score - 60) * 0.1, 98);
  } else if (score >= 30 || urgentSymptoms.length > 0) {
    urgency = 'Urgent';
    riskLevel = 'Prompt';
    confidence = Math.min(80 + (score - 30) * 0.3, 95);
  } else if (score >= 15) {
    urgency = 'Semi-Urgent';
    riskLevel = 'Moderate';
    confidence = Math.min(75 + (score - 15) * 0.5, 90);
  } else {
    urgency = 'Non-Urgent';
    riskLevel = 'Low';
    confidence = Math.min(70 + score * 1.0, 85);
  }

  // Generate comprehensive reasoning
  const topFactors = factors.slice(0, 3);
  const reasoning = topFactors.length > 0 
    ? `Primary factors: ${topFactors.map(f => f.factor).join(', ')}`
    : 'Assessment based on standard triage protocols';

  return {
    urgency,
    confidence: Math.round(confidence),
    score,
    normalizedScore: Math.round(normalizedScore),
    riskLevel,
    reasoning,
    factors,
    detailedAnalysis,
    recommendations: generateRecommendations(urgency, factors),
    timestamp: new Date().toISOString()
  };
}

function generateRecommendations(urgency, factors) {
  const recommendations = [];
  
  switch (urgency) {
    case 'Critical':
      recommendations.push('Immediate medical attention required');
      recommendations.push('Alert emergency team');
      recommendations.push('Prepare for potential interventions');
      break;
    case 'Urgent':
      recommendations.push('Prompt medical evaluation needed');
      recommendations.push('Monitor vital signs closely');
      recommendations.push('Prepare diagnostic equipment');
      break;
    case 'Semi-Urgent':
      recommendations.push('Medical evaluation within 30 minutes');
      recommendations.push('Regular monitoring recommended');
      break;
    case 'Non-Urgent':
      recommendations.push('Standard care queue appropriate');
      recommendations.push('Routine monitoring sufficient');
      break;
  }

  // Add specific recommendations based on factors
  factors.slice(0, 2).forEach(factor => {
    if (factor.factor.includes('Heart Rate')) {
      recommendations.push('Cardiac monitoring recommended');
    } else if (factor.factor.includes('Oxygen')) {
      recommendations.push('Respiratory support may be needed');
    } else if (factor.factor.includes('Temperature')) {
      recommendations.push('Temperature management required');
    }
  });

  return recommendations.slice(0, 4); // Limit to 4 recommendations
}

module.exports = { predictTriage };
