import { useState, useEffect } from 'react';
import { Activity, Users, AlertCircle, Clock, TrendingUp, Heart, Thermometer } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const translations = {
  en: {
    dashboard: 'Emergency Department Dashboard',
    totalPatients: 'Total Patients',
    criticalPatients: 'Critical',
    urgentPatients: 'Urgent',
    nonUrgentPatients: 'Non-Urgent',
    avgConfidence: 'Avg AI Confidence',
    priorityDistribution: 'Priority Distribution',
    hourlyAdmissions: 'Hourly Admissions',
    recentPatients: 'Recent Patients',
    noData: 'No data available'
  },
  hi: {
    dashboard: 'आपातकालीन विभाग डैशबोर्ड',
    totalPatients: 'कुल मरीज़',
    criticalPatients: 'गंभीर',
    urgentPatients: 'तत्काल',
    nonUrgentPatients: 'गैर-तत्काल',
    avgConfidence: 'औसत AI विश्वास',
    priorityDistribution: 'प्राथमिकता वितरण',
    hourlyAdmissions: 'प्रति घंटा प्रवेश',
    recentPatients: 'हाल के मरीज़',
    noData: 'कोई डेटा उपलब्ध नहीं'
  },
  ta: {
    dashboard: 'அவசர பிரிவு டாஷ்போர்டு',
    totalPatients: 'மொத்த நோயாளிகள்',
    criticalPatients: 'முக்கியமான',
    urgentPatients: 'அவசர',
    nonUrgentPatients: 'அவசரமற்ற',
    avgConfidence: 'சராசரி AI நம்பிக்கை',
    priorityDistribution: 'முன்னுரிமை விநியோகம்',
    hourlyAdmissions: 'மணிநேர சேர்க்கைகள்',
    recentPatients: 'சமீபத்திய நோயாளிகள்',
    noData: 'தரவு கிடைக்கவில்லை'
  }
};

const COLORS = {
  Critical: '#ef4444',
  Urgent: '#f97316', 
  'Non-Urgent': '#22c55e',
  'Semi-Urgent': '#eab308'
};

const Dashboard = ({ stats, patients = [], language = 'en' }) => {
  const t = translations[language] || translations.en;
  
  // Calculate stats from patients data
  const calculateStats = () => {
    if (!patients || patients.length === 0) {
      return {
        total: 0,
        critical: 0,
        urgent: 0,
        nonUrgent: 0,
        avgConfidence: 0,
        priorityData: [],
        hourlyData: []
      };
    }

    const total = patients.length;
    const critical = patients.filter(p => p.urgency === 'Critical').length;
    const urgent = patients.filter(p => p.urgency === 'Urgent').length;
    const nonUrgent = patients.filter(p => p.urgency === 'Non-Urgent').length;
    const semiUrgent = patients.filter(p => p.urgency === 'Semi-Urgent').length;
    
    const avgConfidence = patients.reduce((sum, p) => sum + (p.confidence || 0), 0) / total;

    const priorityData = [
      { name: 'Critical', value: critical, color: COLORS.Critical },
      { name: 'Urgent', value: urgent, color: COLORS.Urgent },
      { name: 'Semi-Urgent', value: semiUrgent, color: COLORS['Semi-Urgent'] },
      { name: 'Non-Urgent', value: nonUrgent, color: COLORS['Non-Urgent'] }
    ].filter(item => item.value > 0);

    // Generate hourly data (mock for demo)
    const hourlyData = Array.from({ length: 12 }, (_, i) => ({
      hour: `${String(new Date().getHours() - 11 + i).padStart(2, '0')}:00`,
      admissions: Math.floor(Math.random() * 8) + 1
    }));

    return {
      total,
      critical,
      urgent,
      nonUrgent,
      semiUrgent,
      avgConfidence: Math.round(avgConfidence),
      priorityData,
      hourlyData
    };
  };

  const calculatedStats = calculateStats();

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')} dark:bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 text-white rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold mb-2">{t.dashboard}</h2>
        <p className="text-blue-100">Real-time analytics and patient monitoring</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t.totalPatients}
          value={calculatedStats.total}
          icon={Users}
          color="text-blue-600"
          subtitle="Last 24 hours"
        />
        <StatCard
          title={t.criticalPatients}
          value={calculatedStats.critical}
          icon={AlertCircle}
          color="text-red-600"
          subtitle="Immediate attention"
        />
        <StatCard
          title={t.urgentPatients}
          value={calculatedStats.urgent + calculatedStats.semiUrgent}
          icon={Clock}
          color="text-orange-600"
          subtitle="Prompt care needed"
        />
        <StatCard
          title={t.avgConfidence}
          value={`${calculatedStats.avgConfidence}%`}
          icon={TrendingUp}
          color="text-green-600"
          subtitle="AI prediction accuracy"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {t.priorityDistribution}
          </h3>
          {calculatedStats.priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={calculatedStats.priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {calculatedStats.priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              {t.noData}
            </div>
          )}
        </motion.div>

        {/* Hourly Admissions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {t.hourlyAdmissions}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calculatedStats.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="admissions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Patients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {t.recentPatients}
        </h3>
        {patients && patients.length > 0 ? (
          <div className="space-y-3">
            {patients.slice(0, 5).map((patient, index) => (
              <div
                key={patient.id || index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    patient.urgency === 'Critical' ? 'bg-red-500' :
                    patient.urgency === 'Urgent' ? 'bg-orange-500' :
                    patient.urgency === 'Semi-Urgent' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {patient.name || 'Unknown Patient'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Age: {patient.age || 'N/A'} • {patient.gender || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    patient.urgency === 'Critical' ? 'text-red-600' :
                    patient.urgency === 'Urgent' ? 'text-orange-600' :
                    patient.urgency === 'Semi-Urgent' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {patient.urgency || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {patient.confidence ? `${patient.confidence}% confidence` : 'No confidence data'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t.noData}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
