import { useState } from 'react';
import { ToggleLeft, ToggleRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Demo control to override AI decision for presentations
const EmergencyOverride = ({ prediction, onOverride }) => {
  const [enabled, setEnabled] = useState(false);
  const [manualUrgency, setManualUrgency] = useState(prediction?.urgency || 'Urgent');
  const [manualConfidence, setManualConfidence] = useState(prediction?.confidence || 85);

  const applyOverride = () => {
    if (!enabled) return;
    onOverride && onOverride({ urgency: manualUrgency, confidence: manualConfidence, overridden: true });
  };

  return (
    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h4 className="text-sm font-bold text-gray-800 dark:text-white">Emergency Override (Demo)</h4>
        </div>
        <button
          onClick={() => setEnabled((e) => !e)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
            enabled ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}
        >
          {enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          <span>{enabled ? 'Enabled' : 'Disabled'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 opacity-100">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Urgency</label>
          <select
            disabled={!enabled}
            value={manualUrgency}
            onChange={(e) => setManualUrgency(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option>Critical</option>
            <option>Urgent</option>
            <option>Non-Urgent</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Confidence</label>
          <input
            type="number"
            min={1}
            max={100}
            disabled={!enabled}
            value={manualConfidence}
            onChange={(e) => setManualConfidence(Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-gray-600 dark:text-gray-400">Use for demo control of AI output.</p>
        <button
          onClick={applyOverride}
          disabled={!enabled}
          className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4 inline mr-1" /> Apply
        </button>
      </div>
    </div>
  );
};

export default EmergencyOverride;
