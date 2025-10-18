const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const sampleData = require('../data/sampleData');
const { predictTriage } = require('../ai/triageModel');

// In-memory storage (initialized with sample data)
let patients = [...sampleData];

// GET all patients
router.get('/', (req, res) => {
  try {
    // Sort by timestamp (most recent first)
    const sortedPatients = patients.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    res.json(sortedPatients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET single patient by ID
router.get('/:id', (req, res) => {
  try {
    const patient = patients.find(p => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST new patient
router.post('/', (req, res) => {
  try {
    const { name, age, gender, symptoms, vitals, medicalHistory } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !symptoms || !vitals) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get AI prediction
    const prediction = predictTriage({
      age,
      symptoms,
      vitals,
      medicalHistory: medicalHistory || 'None'
    });

    const newPatient = {
      id: uuidv4(),
      name,
      age: parseInt(age),
      gender,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      vitals: {
        heartRate: parseInt(vitals.heartRate),
        bloodPressure: vitals.bloodPressure,
        temperature: parseFloat(vitals.temperature),
        oxygenSaturation: parseInt(vitals.oxygenSaturation)
      },
      medicalHistory: medicalHistory || 'None',
      urgency: prediction.urgency,
      confidence: prediction.confidence,
      timestamp: new Date().toISOString()
    };

    patients.push(newPatient);
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// PUT update patient
router.put('/:id', (req, res) => {
  try {
    const index = patients.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { name, age, gender, symptoms, vitals, medicalHistory } = req.body;

    // Get new AI prediction if vitals or symptoms changed
    const prediction = predictTriage({
      age: age || patients[index].age,
      symptoms: symptoms || patients[index].symptoms,
      vitals: vitals || patients[index].vitals,
      medicalHistory: medicalHistory || patients[index].medicalHistory
    });

    const updatedPatient = {
      ...patients[index],
      name: name || patients[index].name,
      age: age ? parseInt(age) : patients[index].age,
      gender: gender || patients[index].gender,
      symptoms: symptoms || patients[index].symptoms,
      vitals: vitals ? {
        heartRate: parseInt(vitals.heartRate),
        bloodPressure: vitals.bloodPressure,
        temperature: parseFloat(vitals.temperature),
        oxygenSaturation: parseInt(vitals.oxygenSaturation)
      } : patients[index].vitals,
      medicalHistory: medicalHistory !== undefined ? medicalHistory : patients[index].medicalHistory,
      urgency: prediction.urgency,
      confidence: prediction.confidence,
      timestamp: new Date().toISOString()
    };

    patients[index] = updatedPatient;
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// DELETE patient
router.delete('/:id', (req, res) => {
  try {
    const index = patients.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const deletedPatient = patients.splice(index, 1)[0];
    res.json({ message: 'Patient deleted successfully', patient: deletedPatient });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// POST predict triage (standalone prediction without saving)
router.post('/predict', (req, res) => {
  try {
    const { age, symptoms, vitals, medicalHistory } = req.body;

    if (!age || !symptoms || !vitals) {
      return res.status(400).json({ error: 'Missing required fields for prediction' });
    }

    const prediction = predictTriage({
      age,
      symptoms,
      vitals,
      medicalHistory: medicalHistory || 'None'
    });

    res.json(prediction);
  } catch (error) {
    console.error('Error making prediction:', error);
    res.status(500).json({ error: 'Failed to make prediction' });
  }
});

// Export function to get patients data for stats
router.getPatients = () => patients;

module.exports = router;
