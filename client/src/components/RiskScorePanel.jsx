import { ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import { calculateEscalationRisk, detectVitalAnomalies } from '../utils/riskAnalysis';

const Badge = ({ level }) => {
  const map = {
    Critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    High: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[level] || map.Low}`}>{level}</span>;
};

const RiskScorePanel = ({ patient }) => {
  if (!patient) return null;

  const risk = calculateEscalationRisk(patient);
  const anomalies = detectVitalAnomalies(patient);

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-bold text-gray-800 dark:text-white">Escalation Risk</h4>
        </div>
        <Badge level={risk.level} />
      </div>

      {/* Score bar */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${
              risk.score >= 70 ? 'bg-red-500' : risk.score >= 40 ? 'bg-orange-500' : risk.score >= 20 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${risk.score}%` }}
          />
        </div>
        <div className="w-12 text-right text-sm font-bold text-gray-800 dark:text-white">{risk.score}%</div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{risk.recommendation}</p>

      {/* Top factors */}
      {risk.factors.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Top contributing factors</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {risk.factors.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-700 dark:text-gray-300">{f.name}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">+{f.impact}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs font-bold text-red-700 dark:text-red-300">Vital anomalies detected</span>
          </div>
          <ul className="space-y-1">
            {anomalies.map((a, i) => (
              <li key={i} className="text-xs text-red-800 dark:text-red-200">{a.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <Activity className="w-3 h-3" />
        <span>Risk score updates with each change in symptoms or vitals</span>
      </div>
    </div>
  );
};

export default RiskScorePanel;
