import * as tf from '@tensorflow/tfjs';

/**
 * TensorFlow.js AI Model for Medical Triage
 * Uses a simple feed-forward neural network for real-time predictions
 */

class TriageAI {
  constructor() {
    this.model = null;
    this.isReady = false;
  }

  async initialize() {
    if (this.isReady) return;

    // Create a simple neural network model
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [12], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 3, activation: 'softmax' }) // 3 classes: Critical, Urgent, Non-Urgent
      ]
    });

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Pre-train with synthetic data for demo purposes
    await this.pretrainModel();
    
    this.isReady = true;
    console.log('✅ TensorFlow.js Triage AI Model Initialized');
  }

  async pretrainModel() {
    // Generate synthetic training data based on medical rules
    const trainingData = this.generateTrainingData(200);
    const xs = tf.tensor2d(trainingData.inputs);
    const ys = tf.tensor2d(trainingData.outputs);

    // Train the model
    await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      verbose: 0,
      shuffle: true
    });

    xs.dispose();
    ys.dispose();
  }

  generateTrainingData(samples) {
    const inputs = [];
    const outputs = [];

    for (let i = 0; i < samples; i++) {
      // Generate random patient data
      const age = Math.floor(Math.random() * 90) + 1;
      const gender = Math.random() > 0.5 ? 1 : 0;
      const heartRate = Math.floor(Math.random() * 80) + 50;
      const systolic = Math.floor(Math.random() * 80) + 90;
      const diastolic = Math.floor(Math.random() * 40) + 60;
      const temperature = Math.random() * 4 + 35.5;
      const o2Sat = Math.floor(Math.random() * 20) + 80;
      
      // Symptom severity (0-1 scale)
      const hasCriticalSymptoms = Math.random() > 0.7 ? 1 : 0;
      const hasUrgentSymptoms = Math.random() > 0.5 ? 1 : 0;
      const painLevel = Math.random();
      const hasHistory = Math.random() > 0.6 ? 1 : 0;
      const consciousnessLevel = Math.random();

      // Normalize inputs
      const normalizedInput = [
        age / 100,
        gender,
        heartRate / 200,
        systolic / 200,
        diastolic / 150,
        temperature / 42,
        o2Sat / 100,
        hasCriticalSymptoms,
        hasUrgentSymptoms,
        painLevel,
        hasHistory,
        consciousnessLevel
      ];

      // Determine urgency level based on rules
      let urgencyClass = [0, 0, 1]; // Non-Urgent by default
      
      // Critical conditions
      if (
        hasCriticalSymptoms > 0.5 ||
        heartRate > 120 ||
        o2Sat < 90 ||
        systolic > 180 ||
        systolic < 90 ||
        temperature > 39.5
      ) {
        urgencyClass = [1, 0, 0]; // Critical
      }
      // Urgent conditions
      else if (
        hasUrgentSymptoms > 0.5 ||
        heartRate > 100 ||
        o2Sat < 94 ||
        systolic > 160 ||
        temperature > 38.5 ||
        age > 70
      ) {
        urgencyClass = [0, 1, 0]; // Urgent
      }

      inputs.push(normalizedInput);
      outputs.push(urgencyClass);
    }

    return { inputs, outputs };
  }

  encodeSymptoms(symptoms) {
    const criticalSymptoms = [
      'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious', 
      'seizure', 'severe allergic reaction', 'stroke', 'cardiac arrest'
    ];
    
    const urgentSymptoms = [
      'severe headache', 'abdominal pain', 'high fever', 'vomiting', 
      'fracture', 'deep cut', 'severe burns', 'poisoning'
    ];

    const symptomsLower = symptoms.map(s => s.toLowerCase());
    
    const hasCritical = symptomsLower.some(s => 
      criticalSymptoms.some(cs => s.includes(cs))
    );
    
    const hasUrgent = symptomsLower.some(s => 
      urgentSymptoms.some(us => s.includes(us))
    );

    return {
      hasCritical: hasCritical ? 1 : 0,
      hasUrgent: hasUrgent ? 1 : 0,
      painLevel: symptoms.length > 0 ? Math.min(symptoms.length / 5, 1) : 0
    };
  }

  async predict(patientData) {
    if (!this.isReady) {
      await this.initialize();
    }

    const { age, gender, symptoms, vitals, medicalHistory } = patientData;

    // Parse blood pressure
    const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);

    // Encode symptoms
    const symptomEncoding = this.encodeSymptoms(symptoms);

    // Prepare input features (normalized)
    const inputFeatures = [
      age / 100,
      gender === 'Male' ? 1 : 0,
      vitals.heartRate / 200,
      systolic / 200,
      diastolic / 150,
      vitals.temperature / 42,
      vitals.oxygenSaturation / 100,
      symptomEncoding.hasCritical,
      symptomEncoding.hasUrgent,
      symptomEncoding.painLevel,
      medicalHistory && medicalHistory !== 'None' ? 1 : 0,
      1 // consciousness level (assume conscious for input)
    ];

    // Make prediction
    const inputTensor = tf.tensor2d([inputFeatures]);
    const prediction = this.model.predict(inputTensor);
    const probabilities = await prediction.data();
    
    inputTensor.dispose();
    prediction.dispose();

    // Get urgency level and confidence
    const urgencyLevels = ['Critical', 'Urgent', 'Non-Urgent'];
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    const urgency = urgencyLevels[maxIndex];
    const confidence = Math.round(probabilities[maxIndex] * 100);

    return {
      urgency,
      confidence,
      probabilities: {
        critical: Math.round(probabilities[0] * 100),
        urgent: Math.round(probabilities[1] * 100),
        nonUrgent: Math.round(probabilities[2] * 100)
      }
    };
  }
}

// Singleton instance
const triageAI = new TriageAI();

export default triageAI;
