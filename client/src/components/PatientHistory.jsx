import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit2, Trash2, Download, User, Activity, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n/translations';
import { patientAPI } from '../utils/api';
import { exportPatientsToPDF, exportSinglePatientPDF } from '../utils/pdfExport';
import PatientTimeline from './PatientTimeline';

const ITEMS_PER_PAGE = 5;

const PatientHistory = ({ language, refreshTrigger }) => {
  const { t } = useTranslation(language);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchQuery, urgencyFilter]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await patientAPI.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Urgency filter
    if (urgencyFilter !== 'All') {
      filtered = filtered.filter(patient => patient.urgency === urgencyFilter);
    }

    setFilteredPatients(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('patients.deleteConfirm'))) {
      try {
        await patientAPI.delete(id);
        setPatients(patients.filter(p => p.id !== id));
        alert(t('notifications.patientDeleted'));
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert(t('notifications.error'));
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Age', 'Gender', 'Symptoms', 'Heart Rate', 'Blood Pressure', 'Temperature', 'O2 Saturation', 'Urgency', 'Confidence', 'Timestamp'];
    const rows = filteredPatients.map(p => [
      p.name,
      p.age,
      p.gender,
      p.symptoms.join('; '),
      p.vitals.heartRate,
      p.vitals.bloodPressure,
      p.vitals.temperature,
      p.vitals.oxygenSaturation,
      p.urgency,
      p.confidence,
      new Date(p.timestamp).toLocaleString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient_history.csv';
    a.click();
  };

  const getUrgencyBadge = (urgency) => {
    const configs = {
      Critical: 'bg-critical text-white',
      Urgent: 'bg-urgent text-white',
      'Non-Urgent': 'bg-nonurgent text-white'
    };
    return configs[urgency] || 'bg-gray-500 text-white';
  };

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="card p-8 text-center dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading patient records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('patients.title')}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => exportPatientsToPDF(filteredPatients)}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>{t('patients.export')}</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-4 mb-6 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t('patients.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">{t('patients.all')}</option>
              <option value="Critical">{t('result.critical')}</option>
              <option value="Urgent">{t('result.urgent')}</option>
              <option value="Non-Urgent">{t('result.nonUrgent')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <div className="card p-8 text-center dark:bg-gray-800">
          <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('patients.noPatients')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {currentPatients.map((patient) => (
              <div
                key={patient.id}
                className="card p-6 dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300"
              >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{patient.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyBadge(patient.urgency)}`}>
                      {patient.urgency}
                    </span>
                    <span className="text-sm text-gray-500">
                      {patient.confidence}% confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-gray-500">Age/Gender</span>
                      <p className="font-semibold text-gray-800">{patient.age} / {patient.gender}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Heart Rate</span>
                      <p className="font-semibold text-gray-800">{patient.vitals.heartRate} bpm</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Blood Pressure</span>
                      <p className="font-semibold text-gray-800">{patient.vitals.bloodPressure}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">O2 Saturation</span>
                      <p className="font-semibold text-gray-800">{patient.vitals.oxygenSaturation}%</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-xs text-gray-500">Symptoms:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patient.symptoms.map((symptom, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(patient.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title={t('patients.view')}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(patient.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title={t('patients.delete')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length} patients
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
        </>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Patient Details</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
                </button>
                <button
                  onClick={() => exportSinglePatientPDF(selectedPatient)}
                  className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Name</label>
                  <p className="text-lg text-gray-800 dark:text-white">{selectedPatient.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Age</label>
                    <p className="text-lg text-gray-800 dark:text-white">{selectedPatient.age}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gender</label>
                    <p className="text-lg text-gray-800 dark:text-white">{selectedPatient.gender}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Symptoms</label>
                  <p className="text-gray-800 dark:text-gray-300">{selectedPatient.symptoms.join(', ')}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Vital Signs</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className="text-gray-800 dark:text-gray-300">HR: {selectedPatient.vitals.heartRate} bpm</p>
                    <p className="text-gray-800 dark:text-gray-300">BP: {selectedPatient.vitals.bloodPressure}</p>
                    <p className="text-gray-800 dark:text-gray-300">Temp: {selectedPatient.vitals.temperature}°C</p>
                    <p className="text-gray-800 dark:text-gray-300">O2: {selectedPatient.vitals.oxygenSaturation}%</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Medical History</label>
                  <p className="text-gray-800 dark:text-gray-300">{selectedPatient.medicalHistory || 'None'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Triage Assessment</label>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getUrgencyBadge(selectedPatient.urgency)}`}>
                      {selectedPatient.urgency}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">Confidence: {selectedPatient.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {showTimeline && (
                <div>
                  <PatientTimeline patient={selectedPatient} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
