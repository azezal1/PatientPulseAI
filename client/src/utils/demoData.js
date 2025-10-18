export const demoCases = [
  {
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
    medicalHistory: 'Hypertension, Diabetes'
  },
  {
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
    medicalHistory: 'Migraine'
  },
  {
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
    medicalHistory: 'Asthma, COPD'
  },
  {
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
    medicalHistory: 'None'
  },
  {
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
    medicalHistory: 'Gastritis'
  }
];

export const getRandomDemoCase = () => {
  return demoCases[Math.floor(Math.random() * demoCases.length)];
};
