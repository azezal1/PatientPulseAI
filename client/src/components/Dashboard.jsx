import { useState, useEffect } from 'react';
import { Activity, Users, AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { useTranslation } from '../i18n/translations';
import { patientAPI } from '../utils/api';
import LiveSimulation from './LiveSimulation';
import WorkloadPredictor from './WorkloadPredictor';
import DragDropQueue from './DragDropQueue';

const Dashboard = ({ language, refreshTrigger }) => {
  const { t } = useTranslation(language);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    urgent: 0,
    nonUrgent: 0,
    avgConfidence: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await patientAPI.getAll();
      setPatients(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const critical = data.filter(p => p.urgency === 'Critical').length;
    const urgent = data.filter(p => p.urgency === 'Urgent').length;
    const nonUrgent = data.filter(p => p.urgency === 'Non-Urgent').length;
    const avgConfidence = data.length > 0
      ? Math.round(data.reduce((sum, p) => sum + p.confidence, 0) / data.length)
      : 0;

    setStats({
      total: data.length,
      critical,
      urgent,
      nonUrgent,
      avgConfidence
    });
  };

  const pieChartData = [
    { name: 'Critical', value: stats.critical, color: '#EF4444' },
    { name: 'Urgent', value: stats.urgent, color: '#F59E0B' },
    { name: 'Non-Urgent', value: stats.nonUrgent, color: '#10B981' }
  ];

  const recentPatients = patients.slice(0, 5);
  const criticalTicker = patients.filter(p => p.urgency === 'Critical').slice(0, 10);

  // Build a simple line trend of last N patients by urgency weight
  const trendData = patients.slice(0, 12).map((p, idx) => ({
    name: `#${patients.length - idx}`,
    weight: p.urgency === 'Critical' ? 3 : p.urgency === 'Urgent' ? 2 : 1
  })).reverse();

  const COLORS = {
    Critical: '#EF4444',
    Urgent: '#F59E0B',
    'Non-Urgent': '#10B981'
  };

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.title')}</h2>

      {/* Rolling Critical Ticker */}
      <div className="overflow-hidden rounded-lg border border-red-300 dark:border-red-700">
        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div className="whitespace-nowrap animate-[scroll_18s_linear_infinite]">
            {criticalTicker.length > 0 ? (
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                {criticalTicker.map((p, i) => `${p.name} (${p.vitals.oxygenSaturation}% O2, HR ${p.vitals.heartRate})`).join(' • ')}
              </span>
            ) : (
              <span className="text-sm text-red-700 dark:text-red-300">No current critical patients</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.total}</span>
          </div>
          <p className="text-sm font-semibold opacity-90">{t('dashboard.totalPatients')}</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.critical}</span>
          </div>
          <p className="text-sm font-semibold opacity-90">{t('dashboard.criticalCases')}</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.urgent}</span>
          </div>
          <p className="text-sm font-semibold opacity-90">{t('dashboard.urgentCases')}</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{stats.nonUrgent}</span>
          </div>
          <p className="text-sm font-semibold opacity-90">{t('dashboard.nonUrgentCases')}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('dashboard.distributionTitle')}</h3>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* Bar & Line Charts */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Urgency Level Comparison & Trend</h3>
          {stats.total > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pieChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6">
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Simulation & Workload Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveSimulation onPatientAdded={() => { /* Dashboard fetch handled by parent via refreshTrigger */ }} />
        <WorkloadPredictor />
      </div>

      {/* Drag & Drop Queue */}
      {patients.length > 0 && (
        <DragDropQueue
          patients={patients}
          onReorder={() => { /* demo only */ }}
        />
      )}

      {/* Recent Cases */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">{t('dashboard.recentCases')}</h3>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-600">
              {t('dashboard.avgConfidence')}: {stats.avgConfidence}%
            </span>
          </div>
        </div>

        {recentPatients.length > 0 ? (
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-3 h-3 rounded-full ${
                    patient.urgency === 'Critical' ? 'bg-critical animate-pulse' :
                    patient.urgency === 'Urgent' ? 'bg-urgent' :
                    'bg-nonurgent'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{patient.name}</p>
                    <p className="text-sm text-gray-600">
                      {patient.age} years, {patient.gender}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      patient.urgency === 'Critical' ? 'bg-critical text-white' :
                      patient.urgency === 'Urgent' ? 'bg-urgent text-white' :
                      'bg-nonurgent text-white'
                    }`}>
                      {patient.urgency}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(patient.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center space-x-1">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        {patient.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent cases</p>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0}%
          </div>
          <p className="text-sm text-gray-600 font-semibold">Critical Rate</p>
        </div>

        <div className="card p-6 text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {stats.avgConfidence}%
          </div>
          <p className="text-sm text-gray-600 font-semibold">AI Accuracy</p>
        </div>

        <div className="card p-6 text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {patients.length > 0 ? Math.round(patients.length / 24) : 0}
          </div>
          <p className="text-sm text-gray-600 font-semibold">Avg. Cases/Hour</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
