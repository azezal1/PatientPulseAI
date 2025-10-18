const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Enhanced data storage
const DATA_DIR = path.join(__dirname, '../data');
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Initialize data files
const initializeDataFiles = async () => {
  await ensureDataDir();
  
  const defaultFiles = {
    [PATIENTS_FILE]: [],
    [STATS_FILE]: {
      totalPatients: 0,
      urgentCases: 0,
      averageWaitTime: 0,
      aiAccuracy: 95,
      lastUpdated: new Date().toISOString()
    },
    [USERS_FILE]: [
      {
        id: 'demo-admin',
        username: 'admin',
        password: 'admin123', // In production, this should be hashed
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_users'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-doctor',
        username: 'doctor',
        password: 'doctor123',
        role: 'doctor',
        permissions: ['read', 'write'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-nurse',
        username: 'nurse',
        password: 'nurse123',
        role: 'nurse',
        permissions: ['read'],
        createdAt: new Date().toISOString()
      }
    ],
    [LOGS_FILE]: []
  };

  for (const [file, defaultData] of Object.entries(defaultFiles)) {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, JSON.stringify(defaultData, null, 2));
    }
  }
};

// Initialize on startup
initializeDataFiles().catch(console.error);

// Utility functions
const readJSONFile = async (filePath, defaultValue = []) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Failed to read ${filePath}:`, error.message);
    return defaultValue;
  }
};

const writeJSONFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Failed to write ${filePath}:`, error.message);
    return false;
  }
};

const logActivity = async (action, userId, details = {}) => {
  try {
    const logs = await readJSONFile(LOGS_FILE, []);
    logs.push({
      id: Date.now().toString(),
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
      ip: details.ip || 'unknown'
    });
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    await writeJSONFile(LOGS_FILE, logs);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Simple authentication middleware (demo purposes)
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  
  // In a real app, you'd verify JWT tokens here
  // For demo, we'll use simple username:password base64
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [username, password] = decoded.split(':');
    
    const users = await readJSONFile(USERS_FILE, []);
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Permission check middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Routes

// Authentication
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const users = await readJSONFile(USERS_FILE, []);
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      await logActivity('login_failed', null, { username, ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create simple token (in production, use JWT)
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    
    await logActivity('login_success', user.id, { ip: req.ip });
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Live data endpoints
router.get('/live/metrics', authenticate, async (req, res) => {
  try {
    const patients = await readJSONFile(PATIENTS_FILE, []);
    const stats = await readJSONFile(STATS_FILE, {});
    
    // Generate live metrics
    const now = new Date();
    const todayPatients = patients.filter(p => {
      const patientDate = new Date(p.createdAt || p.timestamp);
      return patientDate.toDateString() === now.toDateString();
    });
    
    const urgentCases = patients.filter(p => 
      ['urgent', 'critical'].includes(p.urgency?.toLowerCase())
    ).length;
    
    const liveMetrics = {
      activePatients: todayPatients.length,
      totalPatients: patients.length,
      urgentCases,
      criticalCases: patients.filter(p => p.urgency?.toLowerCase() === 'critical').length,
      averageWaitTime: Math.floor(Math.random() * 30) + 15, // Simulated
      aiAccuracy: stats.aiAccuracy || 95,
      bedOccupancy: Math.floor(Math.random() * 20) + 70, // Simulated
      staffUtilization: Math.floor(Math.random() * 15) + 80, // Simulated
      lastUpdated: new Date().toISOString()
    };
    
    await logActivity('metrics_accessed', req.user.id, { ip: req.ip });
    
    res.json({
      success: true,
      data: liveMetrics
    });
  } catch (error) {
    console.error('Live metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch live metrics' });
  }
});

// Forecast API
router.get('/forecast/patient-flow', authenticate, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const patients = await readJSONFile(PATIENTS_FILE, []);
    
    // Generate forecast data based on historical patterns
    const forecast = [];
    const now = new Date();
    
    for (let i = 0; i < parseInt(hours); i++) {
      const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hourOfDay = hour.getHours();
      
      // Simulate realistic hospital patterns
      let baseLoad = 10;
      if (hourOfDay >= 8 && hourOfDay <= 18) baseLoad = 25; // Day shift
      if (hourOfDay >= 18 && hourOfDay <= 22) baseLoad = 20; // Evening
      if (hourOfDay >= 22 || hourOfDay <= 6) baseLoad = 8;   // Night
      
      const variance = Math.random() * 10 - 5; // ±5 patients
      const predicted = Math.max(0, Math.round(baseLoad + variance));
      
      forecast.push({
        hour: hour.toISOString(),
        predicted,
        confidence: Math.round(85 + Math.random() * 10), // 85-95%
        factors: [
          'Historical patterns',
          'Day of week',
          'Seasonal trends'
        ]
      });
    }
    
    await logActivity('forecast_accessed', req.user.id, { hours, ip: req.ip });
    
    res.json({
      success: true,
      data: {
        forecast,
        metadata: {
          generatedAt: new Date().toISOString(),
          hoursAhead: parseInt(hours),
          confidence: 'Medium-High',
          model: 'Time Series + Pattern Recognition'
        }
      }
    });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// Enhanced patient management
router.get('/patients/enhanced', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      urgency, 
      dateFrom, 
      dateTo,
      search 
    } = req.query;
    
    let patients = await readJSONFile(PATIENTS_FILE, []);
    
    // Apply filters
    if (urgency && urgency !== 'all') {
      patients = patients.filter(p => p.urgency?.toLowerCase() === urgency.toLowerCase());
    }
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      patients = patients.filter(p => new Date(p.createdAt || p.timestamp) >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      patients = patients.filter(p => new Date(p.createdAt || p.timestamp) <= toDate);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      patients = patients.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.symptoms?.some(s => s.toLowerCase().includes(searchLower))
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPatients = patients.slice(startIndex, endIndex);
    
    await logActivity('patients_accessed', req.user.id, { 
      filters: { urgency, dateFrom, dateTo, search },
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: paginatedPatients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: patients.length,
        pages: Math.ceil(patients.length / limit)
      }
    });
  } catch (error) {
    console.error('Enhanced patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// AI model retraining simulation
router.post('/ai/retrain', authenticate, requirePermission('write'), async (req, res) => {
  try {
    const { modelType = 'triage', dataPoints = 100 } = req.body;
    
    // Simulate retraining process
    const retrainingSteps = [
      'Validating training data',
      'Preprocessing features',
      'Training neural network',
      'Evaluating performance',
      'Updating model weights',
      'Running validation tests'
    ];
    
    // Simulate async retraining
    setTimeout(async () => {
      const stats = await readJSONFile(STATS_FILE, {});
      stats.aiAccuracy = Math.min(99, (stats.aiAccuracy || 95) + Math.random() * 2);
      stats.lastRetrained = new Date().toISOString();
      stats.retrainingHistory = stats.retrainingHistory || [];
      stats.retrainingHistory.push({
        timestamp: new Date().toISOString(),
        modelType,
        dataPoints,
        accuracyImprovement: Math.random() * 2,
        userId: req.user.id
      });
      
      await writeJSONFile(STATS_FILE, stats);
    }, 5000);
    
    await logActivity('ai_retrain_started', req.user.id, { modelType, dataPoints, ip: req.ip });
    
    res.json({
      success: true,
      data: {
        retrainingId: `retrain_${Date.now()}`,
        status: 'started',
        estimatedDuration: '5-10 minutes',
        steps: retrainingSteps,
        modelType,
        dataPoints
      }
    });
  } catch (error) {
    console.error('AI retrain error:', error);
    res.status(500).json({ error: 'Failed to start retraining' });
  }
});

// Export data
router.get('/export/:type', authenticate, requirePermission('read'), async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json', dateFrom, dateTo } = req.query;
    
    let data = [];
    let filename = '';
    
    switch (type) {
      case 'patients':
        data = await readJSONFile(PATIENTS_FILE, []);
        filename = `patients_export_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'logs':
        if (!req.user.permissions.includes('manage_users')) {
          return res.status(403).json({ error: 'Admin access required' });
        }
        data = await readJSONFile(LOGS_FILE, []);
        filename = `logs_export_${new Date().toISOString().split('T')[0]}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }
    
    // Apply date filters
    if (dateFrom || dateTo) {
      data = data.filter(item => {
        const itemDate = new Date(item.createdAt || item.timestamp);
        if (dateFrom && itemDate < new Date(dateFrom)) return false;
        if (dateTo && itemDate > new Date(dateTo)) return false;
        return true;
      });
    }
    
    await logActivity('data_exported', req.user.id, { type, format, count: data.length, ip: req.ip });
    
    if (format === 'csv') {
      // Convert to CSV (simplified)
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json({
        success: true,
        data,
        exportInfo: {
          type,
          count: data.length,
          exportedAt: new Date().toISOString(),
          exportedBy: req.user.username
        }
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Activity logs
router.get('/logs', authenticate, requirePermission('manage_users'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    
    let logs = await readJSONFile(LOGS_FILE, []);
    
    // Apply filters
    if (action) {
      logs = logs.filter(log => log.action.includes(action));
    }
    
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = logs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length,
        pages: Math.ceil(logs.length / limit)
      }
    });
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Utility function to convert JSON to CSV
const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

module.exports = router;
