import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Patient API endpoints
export const patientAPI = {
  // Get all patients
  getAll: async () => {
    const response = await api.get('/patients');
    return response.data;
  },

  // Get single patient
  getById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Create new patient
  create: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  // Update patient
  update: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  // Delete patient
  delete: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  // Get prediction
  predict: async (patientData) => {
    const response = await api.post('/patients/predict', patientData);
    return response.data;
  }
};

export default api;
