import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, Clock, AlertTriangle, TrendingUp, Brain, 
  Heart, Thermometer, Droplets, Wind, Eye, MessageSquare,
  BarChart3, PieChart, LineChart, Filter, Download, Maximize2,
  Mic, MicOff, Volume2, VolumeX, RefreshCw, Settings
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, 
  Cell, Area, AreaChart, RadialBarChart, RadialBar
} from 'recharts';
import { enhancedAI, conversationalAI } from '../utils/enhancedAI';
import { getTranslation } from '../utils/translations';

const GlassmorphismDashboard = ({ 
  language = 'en', 
  theme = 'light', 
  patients = [], 
  stats = null,
  onVoiceCommand 
}) => {
  const [activeMetric, setActiveMetric] = useState('overview');
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [confidenceData, setConfidenceData] = useState([]);
  const [shapData, setShapData] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState({});
  const [filters, setFilters] = useState({
    timeRange: '24h',
    urgencyLevel: 'all',
    department: 'all'
  });

  const t = (key) => getTranslation(language, key);
  const chartRef = useRef(null);

  // Generate live metrics data
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics({
        activePatients: Math.floor(Math.random() * 50) + 20,
        avgWaitTime: Math.floor(Math.random() * 30) + 15,
        aiAccuracy: Math.floor(Math.random() * 10) + 90,
        criticalCases: Math.floor(Math.random() * 5) + 1,
        bedOccupancy: Math.floor(Math.random() * 20) + 70,
        staffUtilization: Math.floor(Math.random() * 15) + 80
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Generate confidence trend data
  useEffect(() => {
    const generateConfidenceData = () => {
      const data = [];
      for (let i = 0; i < 24; i++) {
        data.push({
          hour: `${i}:00`,
          confidence: Math.floor(Math.random() * 20) + 80,
          predictions: Math.floor(Math.random() * 10) + 5,
          accuracy: Math.floor(Math.random() * 15) + 85
        });
      }
      setConfidenceData(data);
    };

    generateConfidenceData();
    const interval = setInterval(generateConfidenceData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate SHAP-like feature importance data
  useEffect(() => {
    const features = [
      { name: 'Heart Rate', importance: 0.25, impact: 'high' },
      { name: 'Blood Pressure', importance: 0.22, impact: 'high' },
      { name: 'Temperature', importance: 0.18, impact: 'medium' },
      { name: 'Oxygen Saturation', importance: 0.15, impact: 'medium' },
      { name: 'Age', importance: 0.12, impact: 'low' },
      { name: 'Symptoms', importance: 0.08, impact: 'low' }
    ];
    setShapData(features);
  }, []);

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    try {
      const response = await conversationalAI.processQuery(aiQuery, patients[0]);
      setAiResponse(response);
      setAiQuery('');
    } catch (error) {
      console.error('AI query error:', error);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAiQuery(transcript);
        handleAIQuery();
      };

      recognition.start();
    }
  };

  const glassmorphismStyle = {
    background: theme === 'dark' 
      ? 'rgba(17, 25, 40, 0.75)' 
      : 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    border: theme === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.125)' 
      : '1px solid rgba(209, 213, 219, 0.3)',
    borderRadius: '12px',
    boxShadow: theme === 'dark'
      ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      : '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      style={glassmorphismStyle}
      className="p-6 relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm flex items-center ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
      
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r from-${color}-500/10 to-transparent`}
        animate={{ x: [-100, 100] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );

  const ConfidenceTrendChart = () => (
    <motion.div
      style={glassmorphismStyle}
      className="p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('confidence')} Trend
        </h3>
        <div className="flex space-x-2">
          <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={confidenceData}>
          <defs>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.3)" />
          <XAxis dataKey="hour" stroke="rgba(156, 163, 175, 0.7)" />
          <YAxis stroke="rgba(156, 163, 175, 0.7)" />
          <Tooltip 
            contentStyle={{
              ...glassmorphismStyle,
              border: 'none'
            }}
          />
          <Area
            type="monotone"
            dataKey="confidence"
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#confidenceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );

  const SHAPVisualization = () => (
    <motion.div
      style={glassmorphismStyle}
      className="p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('shapAnalysis')}
      </h3>
      
      <div className="space-y-4">
        {shapData.map((feature, index) => (
          <div key={feature.name} className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {feature.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(feature.importance * 100)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  feature.impact === 'high' ? 'bg-red-500' :
                  feature.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${feature.importance * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const AISidebar = () => (
    <AnimatePresence>
      {isAISidebarOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed right-0 top-0 h-full w-96 z-50"
          style={{
            ...glassmorphismStyle,
            borderRadius: '0 0 0 12px',
            borderRight: 'none'
          }}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('aiAssistant')}
              </h2>
              <button
                onClick={() => setIsAISidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Response Display */}
            <div className="flex-1 overflow-y-auto mb-4">
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                >
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {aiResponse.response}
                      </p>
                      {aiResponse.recommendations && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Recommendations:
                          </p>
                          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                            {aiResponse.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Confidence: {aiResponse.confidence}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
                  placeholder={t('askQuestion')}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                />
                <button
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-lg ${
                    isListening 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
              
              <button
                onClick={handleAIQuery}
                disabled={!aiQuery.trim()}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('submit')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen p-6 relative">
      {/* Background with animated gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('liveMetrics')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time AI-powered healthcare analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAISidebarOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Brain className="w-5 h-5" />
              <span>{t('aiAssistant')}</span>
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm"
            >
              <RefreshCw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </motion.div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <MetricCard
            title="Active Patients"
            value={liveMetrics.activePatients}
            change={2.5}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Avg Wait Time"
            value={`${liveMetrics.avgWaitTime}m`}
            change={-1.2}
            icon={Clock}
            color="green"
          />
          <MetricCard
            title="AI Accuracy"
            value={`${liveMetrics.aiAccuracy}%`}
            change={0.8}
            icon={Brain}
            color="purple"
          />
          <MetricCard
            title="Critical Cases"
            value={liveMetrics.criticalCases}
            change={-0.5}
            icon={AlertTriangle}
            color="red"
          />
          <MetricCard
            title="Bed Occupancy"
            value={`${liveMetrics.bedOccupancy}%`}
            change={1.8}
            icon={Activity}
            color="orange"
          />
          <MetricCard
            title="Staff Utilization"
            value={`${liveMetrics.staffUtilization}%`}
            change={-2.1}
            icon={Heart}
            color="pink"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConfidenceTrendChart />
          <SHAPVisualization />
        </div>
      </div>

      {/* AI Sidebar */}
      <AISidebar />
    </div>
  );
};

export default GlassmorphismDashboard;
