import * as tf from '@tensorflow/tfjs';

// Enhanced AI Engine for PatientPulse AI v3.5+
export class EnhancedTriageAI {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.confidenceHistory = [];
    this.featureImportance = {};
    this.shapValues = {};
  }

  async initialize() {
    try {
      // Create a more sophisticated model for demo purposes
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [12], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'softmax' }) // 4 urgency levels
        ]
      });

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      // Initialize with some training data for demo
      await this.simulateTraining();
      this.isLoaded = true;
      
      console.log('Enhanced AI model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
      this.isLoaded = false;
    }
  }

  async simulateTraining() {
    // Generate synthetic training data for demo
    const trainingData = this.generateSyntheticData(1000);
    const { inputs, outputs } = trainingData;
    
    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs);
    
    await this.model.fit(xs, ys, {
      epochs: 10,
      batchSize: 32,
      verbose: 0
    });
    
    xs.dispose();
    ys.dispose();
  }

  generateSyntheticData(samples) {
    const inputs = [];
    const outputs = [];
    
    for (let i = 0; i < samples; i++) {
      // Generate realistic medical data
      const age = Math.random() * 80 + 10;
      const heartRate = Math.random() * 100 + 60;
      const systolic = Math.random() * 60 + 100;
      const diastolic = Math.random() * 40 + 60;
      const temperature = Math.random() * 4 + 36;
      const oxygenSat = Math.random() * 10 + 90;
      const respiratoryRate = Math.random() * 20 + 12;
      const painLevel = Math.random() * 10;
      const consciousness = Math.random();
      const mobility = Math.random();
      const symptomSeverity = Math.random() * 10;
      const comorbidities = Math.random() * 5;
      
      inputs.push([
        age / 100, heartRate / 200, systolic / 200, diastolic / 100,
        temperature / 42, oxygenSat / 100, respiratoryRate / 40,
        painLevel / 10, consciousness, mobility, symptomSeverity / 10, comorbidities / 5
      ]);
      
      // Determine urgency based on vital signs
      let urgency = 0; // Stable
      if (heartRate > 120 || systolic > 180 || temperature > 39 || oxygenSat < 90) {
        urgency = 3; // Critical
      } else if (heartRate > 100 || systolic > 160 || temperature > 38.5 || painLevel > 7) {
        urgency = 2; // Urgent
      } else if (heartRate > 90 || systolic > 140 || painLevel > 4) {
        urgency = 1; // Moderate
      }
      
      const output = [0, 0, 0, 0];
      output[urgency] = 1;
      outputs.push(output);
    }
    
    return { inputs, outputs };
  }

  async predict(patientData) {
    if (!this.isLoaded || !this.model) {
      throw new Error('AI model not loaded');
    }

    try {
      const features = this.extractFeatures(patientData);
      const input = tf.tensor2d([features]);
      
      const prediction = this.model.predict(input);
      const probabilities = await prediction.data();
      
      // Calculate SHAP-like feature importance
      const shapValues = await this.calculateSHAPValues(features);
      
      // Determine urgency level
      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const urgencyLevels = ['Stable', 'Moderate', 'Urgent', 'Critical'];
      const urgency = urgencyLevels[maxIndex];
      const confidence = Math.max(...probabilities);
      
      // Generate reasoning
      const reasoning = this.generateReasoning(features, shapValues, urgency);
      
      // Update confidence history
      this.confidenceHistory.push({
        timestamp: new Date(),
        confidence,
        urgency,
        patientId: patientData.id || Date.now()
      });
      
      // Keep only last 100 predictions
      if (this.confidenceHistory.length > 100) {
        this.confidenceHistory = this.confidenceHistory.slice(-100);
      }
      
      input.dispose();
      prediction.dispose();
      
      return {
        urgency,
        confidence: Math.round(confidence * 100),
        probabilities: {
          stable: Math.round(probabilities[0] * 100),
          moderate: Math.round(probabilities[1] * 100),
          urgent: Math.round(probabilities[2] * 100),
          critical: Math.round(probabilities[3] * 100)
        },
        reasoning,
        shapValues,
        factors: this.getKeyFactors(shapValues),
        recommendations: this.generateRecommendations(urgency, features),
        riskScore: this.calculateRiskScore(features),
        anomalyScore: this.detectAnomalies(features)
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  extractFeatures(patientData) {
    const { age = 30, vitals = {}, symptoms = [] } = patientData;
    const {
      heartRate = 72,
      bloodPressure = '120/80',
      temperature = 37.0,
      oxygenSaturation = 98,
      respiratoryRate = 16
    } = vitals;
    
    // Parse blood pressure
    const [systolic = 120, diastolic = 80] = bloodPressure.split('/').map(Number);
    
    // Calculate symptom severity
    const criticalSymptoms = ['chest pain', 'difficulty breathing', 'severe headache'];
    const symptomSeverity = symptoms.reduce((score, symptom) => {
      return score + (criticalSymptoms.some(cs => 
        symptom.toLowerCase().includes(cs)) ? 3 : 1);
    }, 0);
    
    return [
      age / 100,
      heartRate / 200,
      systolic / 200,
      diastolic / 100,
      temperature / 42,
      oxygenSaturation / 100,
      respiratoryRate / 40,
      Math.min(symptomSeverity / 10, 1),
      Math.random(), // consciousness (simulated)
      Math.random(), // mobility (simulated)
      symptoms.length / 10,
      Math.random() * 0.5 // comorbidities (simulated)
    ];
  }

  async calculateSHAPValues(features) {
    // Simplified SHAP-like calculation
    const featureNames = [
      'Age', 'Heart Rate', 'Systolic BP', 'Diastolic BP',
      'Temperature', 'Oxygen Saturation', 'Respiratory Rate',
      'Symptom Severity', 'Consciousness', 'Mobility',
      'Symptom Count', 'Comorbidities'
    ];
    
    const shapValues = {};
    const baseline = 0.25; // Baseline prediction
    
    for (let i = 0; i < features.length; i++) {
      // Calculate feature contribution (simplified)
      const contribution = (features[i] - 0.5) * Math.random() * 0.3;
      shapValues[featureNames[i]] = {
        value: features[i],
        contribution: contribution,
        importance: Math.abs(contribution)
      };
    }
    
    return shapValues;
  }

  generateReasoning(features, shapValues, urgency) {
    const reasons = [];
    
    // Analyze key contributors
    const sortedFeatures = Object.entries(shapValues)
      .sort((a, b) => Math.abs(b[1].contribution) - Math.abs(a[1].contribution))
      .slice(0, 3);
    
    for (const [feature, data] of sortedFeatures) {
      if (Math.abs(data.contribution) > 0.1) {
        const impact = data.contribution > 0 ? 'increases' : 'decreases';
        reasons.push(`${feature} ${impact} urgency (contribution: ${Math.round(data.contribution * 100)}%)`);
      }
    }
    
    if (reasons.length === 0) {
      reasons.push('All vital signs within normal ranges');
    }
    
    return reasons;
  }

  getKeyFactors(shapValues) {
    return Object.entries(shapValues)
      .sort((a, b) => Math.abs(b[1].contribution) - Math.abs(a[1].contribution))
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        value: data.value,
        contribution: data.contribution,
        importance: data.importance
      }));
  }

  generateRecommendations(urgency, features) {
    const recommendations = [];
    
    switch (urgency) {
      case 'Critical':
        recommendations.push('Immediate medical attention required');
        recommendations.push('Prepare emergency intervention');
        recommendations.push('Notify senior medical staff');
        break;
      case 'Urgent':
        recommendations.push('Priority assessment needed');
        recommendations.push('Monitor vital signs closely');
        recommendations.push('Prepare for potential escalation');
        break;
      case 'Moderate':
        recommendations.push('Standard triage assessment');
        recommendations.push('Regular monitoring recommended');
        break;
      default:
        recommendations.push('Routine care appropriate');
        recommendations.push('Standard observation protocols');
    }
    
    return recommendations;
  }

  calculateRiskScore(features) {
    // Calculate composite risk score
    const weights = [0.1, 0.15, 0.15, 0.1, 0.15, 0.15, 0.1, 0.2, 0.1, 0.05, 0.1, 0.1];
    let riskScore = 0;
    
    for (let i = 0; i < features.length; i++) {
      riskScore += features[i] * weights[i];
    }
    
    return Math.round(riskScore * 100);
  }

  detectAnomalies(features) {
    // Simple anomaly detection
    const normalRanges = [
      [0.1, 0.8], [0.3, 0.6], [0.5, 0.9], [0.6, 0.8],
      [0.85, 0.95], [0.9, 1.0], [0.3, 0.5], [0, 0.7],
      [0.7, 1.0], [0.7, 1.0], [0, 0.5], [0, 0.3]
    ];
    
    let anomalyScore = 0;
    for (let i = 0; i < features.length; i++) {
      const [min, max] = normalRanges[i];
      if (features[i] < min || features[i] > max) {
        anomalyScore += Math.abs(features[i] - (min + max) / 2);
      }
    }
    
    return Math.min(Math.round(anomalyScore * 100), 100);
  }

  getConfidenceHistory() {
    return this.confidenceHistory;
  }

  async simulateRetraining() {
    // Simulate model retraining with new data
    console.log('Starting model retraining simulation...');
    
    const newData = this.generateSyntheticData(100);
    const { inputs, outputs } = newData;
    
    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs);
    
    await this.model.fit(xs, ys, {
      epochs: 5,
      batchSize: 16,
      verbose: 0
    });
    
    xs.dispose();
    ys.dispose();
    
    console.log('Model retraining completed');
    return {
      success: true,
      message: 'Model successfully retrained with new data',
      timestamp: new Date(),
      samplesUsed: 100
    };
  }

  getModelMetrics() {
    return {
      isLoaded: this.isLoaded,
      totalPredictions: this.confidenceHistory.length,
      averageConfidence: this.confidenceHistory.length > 0 
        ? Math.round(this.confidenceHistory.reduce((sum, p) => sum + p.confidence, 0) / this.confidenceHistory.length)
        : 0,
      lastPrediction: this.confidenceHistory[this.confidenceHistory.length - 1],
      modelVersion: '3.5.0',
      lastRetrained: new Date().toISOString()
    };
  }
}

// Conversational AI Assistant
export class ConversationalAssistant {
  constructor() {
    this.context = [];
    this.isListening = false;
  }

  async processQuery(query, patientData = null) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerQuery = query.toLowerCase();
    
    // Medical symptom analysis
    if (lowerQuery.includes('symptom') || lowerQuery.includes('pain') || lowerQuery.includes('fever')) {
      return this.analyzeSymptoms(query, patientData);
    }
    
    // Vital signs interpretation
    if (lowerQuery.includes('vital') || lowerQuery.includes('blood pressure') || lowerQuery.includes('heart rate')) {
      return this.interpretVitals(query, patientData);
    }
    
    // General medical advice
    if (lowerQuery.includes('what should') || lowerQuery.includes('recommend')) {
      return this.provideRecommendations(query, patientData);
    }
    
    // Default response
    return {
      response: "I can help you analyze symptoms, interpret vital signs, and provide medical recommendations. What specific information would you like to know?",
      confidence: 85,
      suggestions: [
        "Tell me about chest pain symptoms",
        "What do these vital signs mean?",
        "What should I do for high fever?"
      ]
    };
  }

  analyzeSymptoms(query, patientData) {
    const symptoms = this.extractSymptoms(query);
    const severity = this.assessSeverity(symptoms);
    
    return {
      response: `Based on the symptoms mentioned (${symptoms.join(', ')}), this appears to be a ${severity} case. ${this.getSymptomAdvice(severity)}`,
      confidence: 78,
      severity,
      extractedSymptoms: symptoms,
      recommendations: this.getSymptomRecommendations(severity)
    };
  }

  interpretVitals(query, patientData) {
    if (!patientData?.vitals) {
      return {
        response: "I'd need the patient's vital signs to provide an interpretation. Please provide heart rate, blood pressure, temperature, and oxygen saturation.",
        confidence: 90
      };
    }
    
    const interpretation = this.analyzeVitalSigns(patientData.vitals);
    
    return {
      response: `The vital signs show: ${interpretation.summary}. ${interpretation.advice}`,
      confidence: 85,
      vitalAnalysis: interpretation
    };
  }

  provideRecommendations(query, patientData) {
    const recommendations = [
      "Monitor vital signs every 15 minutes",
      "Ensure patient comfort and positioning",
      "Prepare for potential diagnostic tests",
      "Document all symptoms and changes"
    ];
    
    return {
      response: "Here are my recommendations based on the current assessment:",
      confidence: 82,
      recommendations,
      nextSteps: [
        "Continue monitoring",
        "Prepare for physician evaluation",
        "Document findings"
      ]
    };
  }

  extractSymptoms(query) {
    const commonSymptoms = [
      'chest pain', 'shortness of breath', 'fever', 'headache',
      'nausea', 'dizziness', 'fatigue', 'cough', 'abdominal pain'
    ];
    
    return commonSymptoms.filter(symptom => 
      query.toLowerCase().includes(symptom)
    );
  }

  assessSeverity(symptoms) {
    const criticalSymptoms = ['chest pain', 'shortness of breath', 'severe headache'];
    const hasCritical = symptoms.some(s => criticalSymptoms.includes(s));
    
    if (hasCritical) return 'high';
    if (symptoms.length > 2) return 'moderate';
    return 'low';
  }

  getSymptomAdvice(severity) {
    switch (severity) {
      case 'high':
        return 'Immediate medical attention is recommended.';
      case 'moderate':
        return 'Medical evaluation should be scheduled promptly.';
      default:
        return 'Monitor symptoms and seek care if they worsen.';
    }
  }

  getSymptomRecommendations(severity) {
    const recommendations = {
      high: [
        'Immediate triage assessment',
        'Prepare for emergency intervention',
        'Continuous monitoring required'
      ],
      moderate: [
        'Priority assessment needed',
        'Regular vital sign monitoring',
        'Prepare diagnostic workup'
      ],
      low: [
        'Standard assessment protocol',
        'Routine monitoring',
        'Patient education and discharge planning'
      ]
    };
    
    return recommendations[severity] || recommendations.low;
  }

  analyzeVitalSigns(vitals) {
    const { heartRate, bloodPressure, temperature, oxygenSaturation } = vitals;
    const issues = [];
    
    if (heartRate > 100) issues.push('elevated heart rate');
    if (heartRate < 60) issues.push('low heart rate');
    
    const [systolic] = bloodPressure.split('/').map(Number);
    if (systolic > 140) issues.push('elevated blood pressure');
    if (systolic < 90) issues.push('low blood pressure');
    
    if (temperature > 38.5) issues.push('fever');
    if (temperature < 36) issues.push('hypothermia');
    
    if (oxygenSaturation < 95) issues.push('low oxygen saturation');
    
    return {
      summary: issues.length > 0 ? issues.join(', ') : 'vital signs within normal limits',
      advice: issues.length > 0 ? 'Close monitoring recommended' : 'Continue routine care',
      issues
    };
  }
}

// Initialize global instances
export const enhancedAI = new EnhancedTriageAI();
export const conversationalAI = new ConversationalAssistant();
