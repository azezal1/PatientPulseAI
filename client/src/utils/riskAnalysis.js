/**
 * Advanced Risk Analysis & Prediction System
 * Calculates escalation risk, anomaly detection, and trend predictions
 */

export const calculateEscalationRisk = (patient, historicalVitals = []) => {
  let riskScore = 0;
  const factors = [];

  // Age factor (elderly and pediatric at higher risk)
  if (patient.age > 70) {
    riskScore += 15;
    factors.push({ name: 'Advanced age', impact: 15, category: 'demographic' });
  } else if (patient.age < 5) {
    riskScore += 20;
    factors.push({ name: 'Pediatric patient', impact: 20, category: 'demographic' });
  }

  // Vital signs deterioration
  const vitals = patient.vitals;
  
  // Heart Rate trending
  if (vitals.heartRate > 120) {
    riskScore += 25;
    factors.push({ name: 'Severe tachycardia', impact: 25, category: 'vitals' });
  } else if (vitals.heartRate < 50) {
    riskScore += 20;
    factors.push({ name: 'Severe bradycardia', impact: 20, category: 'vitals' });
  }

  // Oxygen saturation critical
  if (vitals.oxygenSaturation < 88) {
    riskScore += 30;
    factors.push({ name: 'Critical hypoxemia', impact: 30, category: 'vitals' });
  } else if (vitals.oxygenSaturation < 92) {
    riskScore += 15;
    factors.push({ name: 'Low oxygen saturation', impact: 15, category: 'vitals' });
  }

  // Blood pressure extremes
  const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
  if (systolic > 180 || systolic < 90) {
    riskScore += 20;
    factors.push({ 
      name: systolic > 180 ? 'Hypertensive crisis' : 'Severe hypotension', 
      impact: 20, 
      category: 'vitals' 
    });
  }

  // Temperature extremes
  if (vitals.temperature > 39.5 || vitals.temperature < 35) {
    riskScore += 15;
    factors.push({ 
      name: vitals.temperature > 39.5 ? 'High fever' : 'Hypothermia', 
      impact: 15, 
      category: 'vitals' 
    });
  }

  // Multiple critical symptoms
  const criticalSymptomCount = patient.symptoms.filter(s => 
    ['chest pain', 'difficulty breathing', 'unconscious', 'seizure', 'severe bleeding']
      .some(critical => s.toLowerCase().includes(critical))
  ).length;

  if (criticalSymptomCount >= 2) {
    riskScore += 25;
    factors.push({ name: 'Multiple critical symptoms', impact: 25, category: 'symptoms' });
  }

  // Comorbidities
  const criticalConditions = ['heart disease', 'diabetes', 'cancer', 'copd', 'kidney failure'];
  const hasComorbidity = criticalConditions.some(condition =>
    patient.medicalHistory && patient.medicalHistory.toLowerCase().includes(condition)
  );

  if (hasComorbidity) {
    riskScore += 10;
    factors.push({ name: 'High-risk comorbidities', impact: 10, category: 'history' });
  }

  // Cap at 100
  riskScore = Math.min(riskScore, 100);

  // Determine risk level
  let riskLevel = 'Low';
  let riskColor = 'green';
  
  if (riskScore >= 70) {
    riskLevel = 'Critical';
    riskColor = 'red';
  } else if (riskScore >= 40) {
    riskLevel = 'High';
    riskColor = 'orange';
  } else if (riskScore >= 20) {
    riskLevel = 'Moderate';
    riskColor = 'yellow';
  }

  return {
    score: Math.round(riskScore),
    level: riskLevel,
    color: riskColor,
    factors: factors.sort((a, b) => b.impact - a.impact).slice(0, 5),
    recommendation: getRecommendation(riskScore)
  };
};

export const detectVitalAnomalies = (patient) => {
  const anomalies = [];
  const vitals = patient.vitals;

  // Heart rate anomalies
  if (vitals.heartRate > 150 || vitals.heartRate < 40) {
    anomalies.push({
      vital: 'Heart Rate',
      value: vitals.heartRate,
      severity: 'critical',
      message: `Extreme heart rate: ${vitals.heartRate} bpm`
    });
  }

  // O2 anomalies
  if (vitals.oxygenSaturation < 90) {
    anomalies.push({
      vital: 'Oxygen Saturation',
      value: vitals.oxygenSaturation,
      severity: 'critical',
      message: `Critical O2 level: ${vitals.oxygenSaturation}%`
    });
  }

  // Temperature anomalies
  if (vitals.temperature > 40 || vitals.temperature < 35) {
    anomalies.push({
      vital: 'Temperature',
      value: vitals.temperature,
      severity: 'critical',
      message: `Extreme temperature: ${vitals.temperature}°C`
    });
  }

  // BP anomalies
  const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
  if (systolic > 180 || systolic < 90 || diastolic > 110 || diastolic < 50) {
    anomalies.push({
      vital: 'Blood Pressure',
      value: vitals.bloodPressure,
      severity: systolic > 180 || systolic < 90 ? 'critical' : 'warning',
      message: `Abnormal BP: ${vitals.bloodPressure}`
    });
  }

  return anomalies;
};

export const predictWorkloadTrend = (patientHistory) => {
  if (patientHistory.length < 5) {
    return { trend: 'stable', prediction: 'Insufficient data', confidence: 0 };
  }

  // Analyze last 24 hours
  const now = new Date();
  const last24Hours = patientHistory.filter(p => 
    (now - new Date(p.timestamp)) < 24 * 60 * 60 * 1000
  );

  const criticalCount = last24Hours.filter(p => p.urgency === 'Critical').length;
  const urgentCount = last24Hours.filter(p => p.urgency === 'Urgent').length;
  const totalCount = last24Hours.length;

  const criticalRate = (criticalCount / totalCount) * 100;
  
  let trend = 'stable';
  let prediction = 'Normal workload expected';
  let confidence = 75;

  if (criticalRate > 40) {
    trend = 'surge';
    prediction = 'High critical patient influx expected - prepare additional resources';
    confidence = 85;
  } else if (criticalRate > 25) {
    trend = 'increasing';
    prediction = 'Moderate increase in critical cases expected';
    confidence = 80;
  } else if (criticalRate < 10) {
    trend = 'decreasing';
    prediction = 'Lower than average critical cases expected';
    confidence = 70;
  }

  return {
    trend,
    prediction,
    confidence,
    stats: {
      totalPatients: totalCount,
      criticalCount,
      urgentCount,
      criticalRate: Math.round(criticalRate)
    }
  };
};

const getRecommendation = (riskScore) => {
  if (riskScore >= 70) {
    return 'IMMEDIATE INTERVENTION REQUIRED - Prepare for potential escalation to ICU';
  } else if (riskScore >= 40) {
    return 'High monitoring priority - Frequent vital checks recommended';
  } else if (riskScore >= 20) {
    return 'Moderate risk - Standard monitoring protocol';
  } else {
    return 'Low risk - Routine care appropriate';
  }
};

export const clusterPatientsBySymptoms = (patients) => {
  const clusters = {
    respiratory: [],
    cardiac: [],
    neurological: [],
    trauma: [],
    infection: [],
    other: []
  };

  patients.forEach(patient => {
    const symptoms = patient.symptoms.map(s => s.toLowerCase()).join(' ');
    
    if (symptoms.includes('breath') || symptoms.includes('wheez') || symptoms.includes('cough')) {
      clusters.respiratory.push(patient);
    } else if (symptoms.includes('chest') || symptoms.includes('heart') || symptoms.includes('cardiac')) {
      clusters.cardiac.push(patient);
    } else if (symptoms.includes('headache') || symptoms.includes('dizz') || symptoms.includes('seizure')) {
      clusters.neurological.push(patient);
    } else if (symptoms.includes('fracture') || symptoms.includes('bleed') || symptoms.includes('injury')) {
      clusters.trauma.push(patient);
    } else if (symptoms.includes('fever') || symptoms.includes('infection') || symptoms.includes('vomit')) {
      clusters.infection.push(patient);
    } else {
      clusters.other.push(patient);
    }
  });

  return clusters;
};
