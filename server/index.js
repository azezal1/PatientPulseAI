const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const patientRoutes = require('./routes/patients');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/patients', patientRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PatientPulse AI v2.0 Server Running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Analytics/Stats endpoint
app.get('/api/stats', (req, res) => {
  try {
    // Get patients data from the routes module
    const patients = require('./routes/patients').getPatients();
    
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentPatients = patients.filter(p => new Date(p.timestamp) >= last24Hours);
    
    // Calculate statistics
    const totalPatients = patients.length;
    const recentCount = recentPatients.length;
    
    const urgencyBreakdown = patients.reduce((acc, patient) => {
      acc[patient.urgency] = (acc[patient.urgency] || 0) + 1;
      return acc;
    }, {});
    
    const avgConfidence = patients.reduce((sum, p) => sum + p.confidence, 0) / totalPatients;
    
    // Hourly distribution for last 24 hours
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).getHours();
      const count = recentPatients.filter(p => 
        new Date(p.timestamp).getHours() === hour
      ).length;
      return { hour, count };
    });
    
    // Age distribution
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };
    
    patients.forEach(p => {
      if (p.age <= 18) ageGroups['0-18']++;
      else if (p.age <= 35) ageGroups['19-35']++;
      else if (p.age <= 50) ageGroups['36-50']++;
      else if (p.age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;
    });
    
    res.json({
      success: true,
      data: {
        totalPatients,
        recentPatients: recentCount,
        urgencyBreakdown,
        avgConfidence: Math.round(avgConfidence),
        hourlyDistribution: hourlyData,
        ageDistribution: ageGroups,
        lastUpdated: now.toISOString()
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate statistics' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 PatientPulse AI Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
