const { v4: uuidv4 } = require('uuid');

const samplePatients = [
  {
    id: uuidv4(),
    name: 'Rajesh Kumar',
    age: 45,
    gender: 'Male',
    symptoms: ['Chest Pain', 'Shortness of Breath'],
    vitals: {
      heartRate: 110,
      bloodPressure: '160/95',
      temperature: 37.2,
      oxygenSaturation: 92
    },
    medicalHistory: 'Hypertension, Diabetes',
    urgency: 'Critical',
    confidence: 94,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Priya Sharma',
    age: 28,
    gender: 'Female',
    symptoms: ['Severe Headache', 'Nausea', 'Vomiting'],
    vitals: {
      heartRate: 88,
      bloodPressure: '130/85',
      temperature: 38.5,
      oxygenSaturation: 98
    },
    medicalHistory: 'Migraine',
    urgency: 'Urgent',
    confidence: 87,
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Mohammed Ali',
    age: 62,
    gender: 'Male',
    symptoms: ['Difficulty Breathing', 'Wheezing'],
    vitals: {
      heartRate: 98,
      bloodPressure: '140/90',
      temperature: 37.0,
      oxygenSaturation: 89
    },
    medicalHistory: 'Asthma, COPD',
    urgency: 'Critical',
    confidence: 91,
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Anita Desai',
    age: 35,
    gender: 'Female',
    symptoms: ['Fever', 'Cough', 'Body Ache'],
    vitals: {
      heartRate: 82,
      bloodPressure: '120/80',
      temperature: 38.8,
      oxygenSaturation: 96
    },
    medicalHistory: 'None',
    urgency: 'Non-Urgent',
    confidence: 85,
    timestamp: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Suresh Patel',
    age: 50,
    gender: 'Male',
    symptoms: ['Abdominal Pain', 'Vomiting'],
    vitals: {
      heartRate: 95,
      bloodPressure: '145/92',
      temperature: 37.8,
      oxygenSaturation: 97
    },
    medicalHistory: 'Gastritis',
    urgency: 'Urgent',
    confidence: 82,
    timestamp: new Date(Date.now() - 9000000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Lakshmi Iyer',
    age: 72,
    gender: 'Female',
    symptoms: ['Chest Pain', 'Sweating', 'Dizziness'],
    vitals: {
      heartRate: 115,
      bloodPressure: '170/100',
      temperature: 37.1,
      oxygenSaturation: 91
    },
    medicalHistory: 'Heart Disease, Diabetes',
    urgency: 'Critical',
    confidence: 96,
    timestamp: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Amit Singh',
    age: 22,
    gender: 'Male',
    symptoms: ['Sprained Ankle', 'Swelling'],
    vitals: {
      heartRate: 75,
      bloodPressure: '118/78',
      temperature: 36.8,
      oxygenSaturation: 99
    },
    medicalHistory: 'None',
    urgency: 'Non-Urgent',
    confidence: 92,
    timestamp: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Deepa Krishnan',
    age: 38,
    gender: 'Female',
    symptoms: ['Severe Allergic Reaction', 'Difficulty Breathing', 'Swelling'],
    vitals: {
      heartRate: 105,
      bloodPressure: '135/88',
      temperature: 37.3,
      oxygenSaturation: 93
    },
    medicalHistory: 'Food Allergies',
    urgency: 'Critical',
    confidence: 93,
    timestamp: new Date(Date.now() - 2700000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Vikram Reddy',
    age: 55,
    gender: 'Male',
    symptoms: ['Back Pain', 'Stiffness'],
    vitals: {
      heartRate: 78,
      bloodPressure: '125/82',
      temperature: 36.9,
      oxygenSaturation: 98
    },
    medicalHistory: 'Arthritis',
    urgency: 'Non-Urgent',
    confidence: 88,
    timestamp: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Shalini Gupta',
    age: 42,
    gender: 'Female',
    symptoms: ['Severe Bleeding', 'Laceration'],
    vitals: {
      heartRate: 102,
      bloodPressure: '110/70',
      temperature: 36.7,
      oxygenSaturation: 95
    },
    medicalHistory: 'None',
    urgency: 'Urgent',
    confidence: 89,
    timestamp: new Date(Date.now() - 4500000).toISOString()
  }
];

module.exports = samplePatients;
