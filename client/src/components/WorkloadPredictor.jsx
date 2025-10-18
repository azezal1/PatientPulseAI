import { useEffect, useState } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { patientAPI } from '../utils/api';
import { predictWorkloadTrend } from '../utils/riskAnalysis';

const WorkloadPredictor = ({ refreshTrigger }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const pts = await patientAPI.getAll();
      const res = predictWorkloadTrend(pts);
      setSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="card p-4 dark:bg-gray-800">
        <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  if (!summary) return null;

  const badge = (trend) => {
    if (trend === 'surge') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (trend === 'increasing') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (trend === 'decreasing') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  return (
    <div className="card p-6 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Workload Prediction (24h)</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badge(summary.trend)}`}>{summary.trend.toUpperCase()}</span>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{summary.prediction}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.stats.totalPatients}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
          <p className="text-xs text-red-700 dark:text-red-300">Critical</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.stats.criticalCount}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
          <p className="text-xs text-orange-700 dark:text-orange-300">Urgent</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.stats.urgentCount}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
          <p className="text-xs text-blue-700 dark:text-blue-300">Critical Rate</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.stats.criticalRate}%</p>
        </div>
      </div>

      <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <Activity className="w-3 h-3" />
        <span>Confidence: {summary.confidence}%</span>
      </div>
    </div>
  );
};

export default WorkloadPredictor;
