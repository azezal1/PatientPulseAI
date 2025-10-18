import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, Mail, Download } from 'lucide-react';
import { getTranslation } from '../utils/translations';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      isReporting: false,
      reportSent: false
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you would send this to your error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = async (error, errorInfo) => {
    try {
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId') || 'anonymous'
      };

      // In a real app, send to your error reporting service
      console.log('Error logged:', errorData);
      
      // Store locally for offline scenarios
      const errors = JSON.parse(localStorage.getItem('patientpulse_errors') || '[]');
      errors.push(errorData);
      localStorage.setItem('patientpulse_errors', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = async () => {
    this.setState({ isReporting: true });
    
    try {
      // Simulate error reporting
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.setState({ reportSent: true, isReporting: false });
    } catch (error) {
      console.error('Failed to report error:', error);
      this.setState({ isReporting: false });
    }
  };

  downloadErrorReport = () => {
    const errorData = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    const { language = 'en', theme = 'light' } = this.props;
    const t = (key) => getTranslation(language, key);

    if (this.state.hasError) {
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-2xl w-full p-8 rounded-2xl shadow-2xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}
            style={{
              background: theme === 'dark' 
                ? 'rgba(17, 25, 40, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            }}
          >
            {/* Error Icon */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
              >
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </motion.div>
              
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Oops! Something went wrong
              </h1>
              
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                PatientPulse AI encountered an unexpected error
              </p>
            </div>

            {/* Error Details */}
            <div className={`p-4 rounded-lg mb-6 ${
              theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Error Details
                </h3>
                <span className={`text-sm px-2 py-1 rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  ID: {this.state.errorId}
                </span>
              </div>
              
              {this.state.error && (
                <div className={`text-sm font-mono p-3 rounded ${
                  theme === 'dark' 
                    ? 'bg-red-900/20 text-red-300' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {this.state.error.message}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <motion.button
                onClick={this.handleReload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reload Page</span>
              </motion.button>

              <motion.button
                onClick={this.handleGoHome}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </motion.button>
            </div>

            {/* Additional Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <motion.button
                onClick={this.handleReportError}
                disabled={this.state.isReporting || this.state.reportSent}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  this.state.reportSent
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {this.state.isReporting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                    <span>Reporting...</span>
                  </>
                ) : this.state.reportSent ? (
                  <>
                    <Bug className="w-4 h-4" />
                    <span>Report Sent</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Report Error</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={this.downloadErrorReport}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </motion.button>
            </div>

            {/* Help Text */}
            <div className={`mt-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
            }`}>
              <h4 className={`font-medium mb-2 ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
              }`}>
                What happened?
              </h4>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
              }`}>
                PatientPulse AI encountered an unexpected error while processing your request. 
                This could be due to a temporary issue with the application or your network connection. 
                Try reloading the page, and if the problem persists, please report the error.
              </p>
            </div>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={`mt-6 p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
              }`}>
                <summary className={`cursor-pointer font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Development Details
                </summary>
                <pre className={`mt-3 text-xs overflow-auto p-3 rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-gray-300' 
                    : 'bg-white text-gray-700'
                }`}>
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className={`mt-2 text-xs overflow-auto p-3 rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-gray-300' 
                      : 'bg-white text-gray-700'
                  }`}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for manual error reporting
export const useErrorHandler = () => {
  const reportError = (error, errorInfo = {}) => {
    console.error('Manual error report:', error, errorInfo);
    
    // Store error for reporting
    const errorData = {
      errorId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...errorInfo
    };

    const errors = JSON.parse(localStorage.getItem('patientpulse_errors') || '[]');
    errors.push(errorData);
    localStorage.setItem('patientpulse_errors', JSON.stringify(errors.slice(-10)));
  };

  return { reportError };
};

export default ErrorBoundary;
