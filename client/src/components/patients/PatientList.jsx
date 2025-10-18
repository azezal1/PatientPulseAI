import { useState, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Users, Download } from 'lucide-react';
import PatientCard from './PatientCard';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

/**
 * Enhanced Patient List with search, filtering, and pagination
 * Displays patients in a grid layout with advanced filtering options
 */
const PatientList = ({ 
  patients = [], 
  onPatientSelect, 
  onPatientView,
  onExport,
  selectedPatient = null,
  itemsPerPage = 6 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = !searchTerm || 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.symptoms || []).some(symptom => 
          symptom.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesUrgency = urgencyFilter === 'All' || patient.urgency === urgencyFilter;
      
      return matchesSearch && matchesUrgency;
    });
  }, [patients, searchTerm, urgencyFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleUrgencyFilterChange = (urgency) => {
    setUrgencyFilter(urgency);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const urgencyStats = useMemo(() => {
    const stats = patients.reduce((acc, patient) => {
      acc[patient.urgency] = (acc[patient.urgency] || 0) + 1;
      return acc;
    }, {});
    return {
      total: patients.length,
      critical: stats.Critical || 0,
      urgent: stats.Urgent || 0,
      nonUrgent: stats['Non-Urgent'] || 0
    };
  }, [patients]);

  if (patients.length === 0) {
    return (
      <Card className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No Patients Found
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          Start by adding patients through the triage form
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Patient Records
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredPatients.length} of {patients.length} patients
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Critical: {urgencyStats.critical}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Urgent: {urgencyStats.urgent}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Non-Urgent: {urgencyStats.nonUrgent}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card variant="compact">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by patient name or symptoms..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>

            {onExport && (
              <Button
                variant="outline"
                onClick={() => onExport(filteredPatients)}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Urgency Level:
                </span>
                {['All', 'Critical', 'Urgent', 'Non-Urgent'].map((urgency) => (
                  <button
                    key={urgency}
                    onClick={() => handleUrgencyFilterChange(urgency)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      urgencyFilter === urgency
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {urgency}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Patient Grid */}
      {filteredPatients.length === 0 ? (
        <Card className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No Matching Patients
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onView={onPatientView}
                onSelect={onPatientSelect}
                isSelected={selectedPatient?.id === patient.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card variant="compact">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPatients.length)} of {filteredPatients.length} patients
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PatientList;
