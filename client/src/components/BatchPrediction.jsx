import { useState } from 'react';
import { Upload, Download, Play, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import triageAI from '../utils/triageAI';
import { patientAPI } from '../utils/api';

const BatchPrediction = ({ language, onComplete }) => {
  const [patients, setPatients] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const lines = event.target.result.split('\n');
        const headers = lines[0].split(',');
        const parsedPatients = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          const patient = {
            name: values[0]?.trim(),
            age: parseInt(values[1]),
            gender: values[2]?.trim(),
            symptoms: values[3]?.split(';').map(s => s.trim()).filter(Boolean),
            vitals: {
              heartRate: parseInt(values[4]),
              bloodPressure: values[5]?.trim(),
              temperature: parseFloat(values[6]),
              oxygenSaturation: parseInt(values[7])
            },
            medicalHistory: values[8]?.trim() || 'None'
          };

          if (patient.name && patient.age) {
            parsedPatients.push(patient);
          }
        }

        setPatients(parsedPatients);
        setResults([]);
        setProgress(0);
      } catch (error) {
        alert('Error parsing CSV file. Please check format.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const processBatch = async () => {
    if (patients.length === 0) return;

    setIsProcessing(true);
    const batchResults = [];

    for (let i = 0; i < patients.length; i++) {
      try {
        const prediction = await triageAI.predict(patients[i]);
        
        const patientWithPrediction = {
          ...patients[i],
          urgency: prediction.urgency,
          confidence: prediction.confidence,
          status: 'success'
        };

        // Save to database
        await patientAPI.create(patientWithPrediction);
        
        batchResults.push(patientWithPrediction);
      } catch (error) {
        batchResults.push({
          ...patients[i],
          status: 'error',
          error: error.message
        });
      }

      setProgress(((i + 1) / patients.length) * 100);
      setResults([...batchResults]);
    }

    setIsProcessing(false);
    if (onComplete) onComplete(batchResults);
  };

  const downloadTemplate = () => {
    const template = `name,age,gender,symptoms,heartRate,bloodPressure,temperature,oxygenSaturation,medicalHistory
John Doe,45,Male,Chest Pain;Shortness of Breath,110,160/95,37.2,92,Hypertension
Jane Smith,28,Female,Severe Headache;Nausea,88,130/85,38.5,98,Migraine`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_prediction_template.csv';
    a.click();
  };

  const getStatusIcon = (status, urgency) => {
    if (status === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (status === 'success') {
      if (urgency === 'Critical') return <AlertCircle className="w-5 h-5 text-red-500" />;
      if (urgency === 'Urgent') return <Clock className="w-5 h-5 text-orange-500" />;
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return null;
  };

  const clearAll = () => {
    setPatients([]);
    setResults([]);
    setProgress(0);
  };

  return (
    <div className="card p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Batch Prediction Mode</h3>
        <button
          onClick={downloadTemplate}
          className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Download className="w-4 h-4" />
          <span>Download Template</span>
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload CSV file with patient data for batch predictions
          </p>
          <label className="btn-primary inline-flex items-center space-x-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Upload CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {patients.length} patients loaded
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {results.length} processed ({Math.round(progress)}%)
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={processBatch}
                disabled={isProcessing || results.length === patients.length}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                <span>{isProcessing ? 'Processing...' : 'Start Batch'}</span>
              </button>
              <button
                onClick={clearAll}
                disabled={isProcessing}
                className="btn-secondary dark:bg-gray-700 dark:text-gray-300 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(result.status, result.urgency)}
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {result.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {result.age} years, {result.gender}
                    </p>
                  </div>
                </div>
                {result.status === 'success' ? (
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      result.urgency === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      result.urgency === 'Urgent' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {result.urgency}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {result.confidence}% confidence
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    Error: {result.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchPrediction;
