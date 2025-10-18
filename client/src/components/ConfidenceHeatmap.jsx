import React from 'react';

// Simple heatmap bars showing how each vital may influence confidence
// Red = risky, Green = normal
const scaleColor = (score) => {
  if (score >= 0.75) return 'bg-red-500';
  if (score >= 0.5) return 'bg-orange-500';
  if (score >= 0.25) return 'bg-yellow-500';
  return 'bg-green-500';
};

const normalizeBP = (bp) => {
  const [s, d] = bp.split('/').map(Number);
  // compute deviation from ideal 120/80
  const sDev = Math.abs(s - 120) / 80; // ~0..1+
  const dDev = Math.abs(d - 80) / 60;
  return Math.min(1, (sDev + dDev) / 2);
};

const ConfidenceHeatmap = ({ patient, prediction }) => {
  if (!patient || !prediction) return null;
  const v = patient.vitals;
  const hr = Math.min(1, Math.abs(v.heartRate - 75) / 75);
  const o2 = Math.min(1, (98 - Math.min(98, v.oxygenSaturation)) / 20);
  const temp = Math.min(1, Math.abs(v.temperature - 37) / 3.5);
  const bp = normalizeBP(v.bloodPressure);

  const items = [
    { name: 'Heart Rate', value: hr, label: `${v.heartRate} bpm` },
    { name: 'Oxygen', value: o2, label: `${v.oxygenSaturation}%` },
    { name: 'Temperature', value: temp, label: `${v.temperature}°C` },
    { name: 'Blood Pressure', value: bp, label: v.bloodPressure },
  ];

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="text-sm font-bold text-gray-800 dark:text-white mb-3">AI Confidence Heatmap (Vitals)</div>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.name}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-300">{it.name}</span>
              <span className="font-semibold text-gray-800 dark:text-white">{it.label}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`${scaleColor(it.value)} h-full`} style={{ width: `${Math.round(it.value*100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">Higher bar intensity indicates greater potential impact on AI confidence.</p>
    </div>
  );
};

export default ConfidenceHeatmap;
