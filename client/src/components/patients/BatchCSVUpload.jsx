import { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Enhanced Batch CSV Upload component for processing multiple patients
 * Includes template download, validation, and progress tracking
 */
const BatchCSVUpload = ({ onUpload, onClose }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const csvTemplate = `name,age,gender,symptoms,heartRate,bloodPressure,temperature,oxygenSaturation,medicalHistory
John Doe,45,Male,"Chest Pain,Difficulty Breathing",95,140/90,37.2,96,Hypertension
Jane Smith,32,Female,"Headache,Nausea",72,120/80,36.8,98,None
Robert Johnson,67,Male,"Abdominal Pain,Fever",88,150/95,38.1,94,"Diabetes,Heart Disease"
Maria Garcia,28,Female,"Dizziness,Fatigue",68,110/70,36.5,99,None
David Wilson,55,Male,"Difficulty Breathing,Chest Pain",105,160/100,37.5,92,"Asthma,Hypertension"`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient_batch_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setErrors([]);
      setResults(null);
    } else {
      setErrors(['Please select a valid CSV file']);
      setFile(null);
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const patients = [];
    const parseErrors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) {
          parseErrors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        const patient = {};
        headers.forEach((header, index) => {
          patient[header] = values[index];
        });

        // Validate and transform data
        const transformedPatient = {
          name: patient.name || '',
          age: parseInt(patient.age) || 0,
          gender: patient.gender || 'Male',
          symptoms: patient.symptoms ? patient.symptoms.split(';').map(s => s.trim()) : [],
          vitals: {
            heartRate: parseInt(patient.heartRate) || 0,
            bloodPressure: patient.bloodPressure || '',
            temperature: parseFloat(patient.temperature) || 0,
            oxygenSaturation: parseInt(patient.oxygenSaturation) || 0
          },
          medicalHistory: patient.medicalHistory || 'None',
          timestamp: new Date().toISOString()
        };

        // Basic validation
        if (!transformedPatient.name) {
          parseErrors.push(`Row ${i + 1}: Name is required`);
          continue;
        }
        if (transformedPatient.age < 0 || transformedPatient.age > 150) {
          parseErrors.push(`Row ${i + 1}: Invalid age`);
          continue;
        }
        if (transformedPatient.symptoms.length === 0) {
          parseErrors.push(`Row ${i + 1}: At least one symptom is required`);
          continue;
        }

        patients.push(transformedPatient);
      } catch (error) {
        parseErrors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return { patients, errors: parseErrors };
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);

    try {
      const csvText = await file.text();
      const { patients, errors: parseErrors } = parseCSV(csvText);

      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        setIsProcessing(false);
        return;
      }

      if (patients.length === 0) {
        setErrors(['No valid patients found in the CSV file']);
        setIsProcessing(false);
        return;
      }

      // Process patients with AI predictions
      const processedPatients = [];
      const processingErrors = [];

      for (let i = 0; i < patients.length; i++) {
        try {
          // Simulate AI processing delay
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Here you would call your AI prediction service
          // For now, we'll simulate predictions
          const mockPrediction = {
            urgency: Math.random() > 0.7 ? 'Critical' : Math.random() > 0.4 ? 'Urgent' : 'Non-Urgent',
            confidence: Math.floor(Math.random() * 30) + 70
          };

          processedPatients.push({
            ...patients[i],
            ...mockPrediction
          });
        } catch (error) {
          processingErrors.push(`Patient ${i + 1} (${patients[i].name}): ${error.message}`);
        }
      }

      setResults({
        total: patients.length,
        processed: processedPatients.length,
        errors: processingErrors.length,
        patients: processedPatients
      });

      if (processedPatients.length > 0 && onUpload) {
        onUpload(processedPatients);
      }

      if (processingErrors.length > 0) {
        setErrors(processingErrors);
      }

    } catch (error) {
      setErrors([`Failed to process file: ${error.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Batch Patient Upload
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload multiple patients via CSV file
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Template Download */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                CSV Template Required
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Download the template file to ensure your CSV has the correct format and required columns.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select CSV File
            </label>
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
              />
              {file && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {file && (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-800 dark:text-white font-medium">{file.name}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                  Processing Errors ({errors.length})
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 max-h-32 overflow-y-auto">
                  {errors.slice(0, 10).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {errors.length > 10 && (
                    <li className="font-medium">... and {errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                  Upload Completed Successfully
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-700 dark:text-green-300">
                  <div>
                    <span className="font-medium">Total:</span> {results.total}
                  </div>
                  <div>
                    <span className="font-medium">Processed:</span> {results.processed}
                  </div>
                  <div>
                    <span className="font-medium">Errors:</span> {results.errors}
                  </div>
                  <div>
                    <span className="font-medium">Success Rate:</span> {Math.round((results.processed / results.total) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {file ? `Ready to process ${file.name}` : 'No file selected'}
          </div>
          
          <div className="flex space-x-3">
            {results && (
              <Button variant="outline" onClick={reset}>
                Upload Another File
              </Button>
            )}
            
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!file || isProcessing}
              loading={isProcessing}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Process CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BatchCSVUpload;
