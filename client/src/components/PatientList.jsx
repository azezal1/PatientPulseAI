import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Clock, User, Heart, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3001/api';

const translations = {
  en: {
    patients: 'Patient Management',
    search: 'Search patients...',
    filter: 'Filter',
    all: 'All',
    critical: 'Critical',
    urgent: 'Urgent',
    nonUrgent: 'Non-Urgent',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    urgency: 'Urgency',
    confidence: 'Confidence',
    timestamp: 'Arrival Time',
    actions: 'Actions',
    view: 'View Details',
    edit: 'Edit',
    delete: 'Delete',
    noPatients: 'No patients found',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    waitTime: 'Wait Time'
  },
  hi: {
    patients: 'मरीज़ प्रबंधन',
    search: 'मरीज़ों को खोजें...',
    filter: 'फ़िल्टर',
    all: 'सभी',
    critical: 'गंभीर',
    urgent: 'तत्काल',
    nonUrgent: 'गैर-तत्काल',
    name: 'नाम',
    age: 'उम्र',
    gender: 'लिंग',
    urgency: 'प्राथमिकता',
    confidence: 'विश्वास',
    timestamp: 'आगमन समय',
    actions: 'कार्य',
    view: 'विवरण देखें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    noPatients: 'कोई मरीज़ नहीं मिला',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    waitTime: 'प्रतीक्षा समय'
  },
  ta: {
    patients: 'நோயாளி மேலாண்மை',
    search: 'நோயாளிகளைத் தேடுங்கள்...',
    filter: 'வடிகட்டு',
    all: 'அனைத்தும்',
    critical: 'முக்கியமான',
    urgent: 'அவசர',
    nonUrgent: 'அவசரமற்ற',
    name: 'பெயர்',
    age: 'வயது',
    gender: 'பாலினம்',
    urgency: 'முன்னுரிமை',
    confidence: 'நம்பிக்கை',
    timestamp: 'வருகை நேரம்',
    actions: 'செயல்கள்',
    view: 'விவரங்களைப் பார்க்கவும்',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    noPatients: 'நோயாளிகள் இல்லை',
    male: 'ஆண்',
    female: 'பெண்',
    other: 'மற்றவை',
    waitTime: 'காத்திருப்பு நேரம்'
  }
};

const PatientList = ({ patients: initialPatients = [], language = 'en', onPredictionView, refreshTrigger }) => {
  const [patients, setPatients] = useState(initialPatients);
  const [filteredPatients, setFilteredPatients] = useState(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchPatients();
  }, [refreshTrigger]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, filterUrgency]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/patients`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Urgency filter
    if (filterUrgency !== 'all') {
      filtered = filtered.filter(patient => patient.urgency === filterUrgency);
    }

    setFilteredPatients(filtered);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`${API_BASE}/patients/${patientId}`);
        toast.success('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        toast.error('Failed to delete patient');
      }
    }
  };

  const formatWaitTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const arrival = new Date(timestamp);
    const diffMs = now - arrival;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Semi-Urgent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Non-Urgent':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Urgent':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'Semi-Urgent':
        return <Heart className="w-4 h-4 text-yellow-600" />;
      case 'Non-Urgent':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t.patients}</h2>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t.all}</option>
              <option value="Critical">{t.critical}</option>
              <option value="Urgent">{t.urgent}</option>
              <option value="Semi-Urgent">Semi-Urgent</option>
              <option value="Non-Urgent">{t.nonUrgent}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Patient Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getUrgencyIcon(patient.urgency)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {patient.name || 'Unknown Patient'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(patient.urgency)}`}>
                          {patient.urgency || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">{t.age}:</span> {patient.age || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">{t.gender}:</span> {
                            patient.gender === 'male' ? t.male :
                            patient.gender === 'female' ? t.female :
                            patient.gender === 'other' ? t.other :
                            patient.gender || 'N/A'
                          }
                        </div>
                        <div>
                          <span className="font-medium">{t.confidence}:</span> {patient.confidence || 0}%
                        </div>
                        <div>
                          <span className="font-medium">{t.waitTime}:</span> {formatWaitTime(patient.timestamp)}
                        </div>
                      </div>
                      
                      {patient.symptoms && patient.symptoms.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Symptoms: </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {patient.symptoms.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onPredictionView && onPredictionView({
                        urgency: patient.urgency,
                        confidence: patient.confidence,
                        reasoning: patient.reasoning || 'AI assessment completed',
                        factors: patient.factors || [],
                        recommendations: patient.recommendations || []
                      })}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={t.view}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            >
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">{t.noPatients}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PatientList;
