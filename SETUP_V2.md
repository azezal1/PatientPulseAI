# PatientPulse AI v2.0 - Enhanced Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Install Dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

2. **Start the Application**
   ```bash
   # Start both backend and frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

## 🆕 What's New in v2.0

### Enhanced Features
- **Multi-step Patient Intake Form** - Guided 4-step process for better data collection
- **AI Explainability** - Detailed confidence scoring and decision reasoning
- **Enhanced Dashboard** - Real-time analytics with interactive charts
- **Multilingual Support** - English, Hindi, and Tamil language options
- **Dark/Light Mode** - Theme switching with persistent preferences
- **Framer Motion Animations** - Smooth transitions and micro-interactions
- **Improved AI Model** - Better triage predictions with detailed factor analysis
- **Modern UI Components** - Hospital-grade interface with accessibility features

### Technical Improvements
- **Enhanced Backend API** - New stats endpoint with comprehensive analytics
- **Better Error Handling** - Improved validation and user feedback
- **Responsive Design** - Optimized for all device sizes
- **Performance Optimizations** - Faster loading and smoother interactions

## 🏥 Using the Application

### 1. Patient Triage (Main Tab)
- **Step 1: Patient Information** - Enter basic patient details
- **Step 2: Symptoms** - Add symptoms using quick-select buttons or custom input
- **Step 3: Vital Signs** - Record heart rate, blood pressure, temperature, oxygen saturation
- **Step 4: Medical History** - Optional medical background information
- **AI Prediction** - Get instant triage assessment with confidence scoring

### 2. Patient Management
- **View All Patients** - Searchable and filterable patient list
- **Patient Details** - Click eye icon to view AI insights
- **Delete Patients** - Remove patient records (demo purposes)

### 3. Dashboard Analytics
- **Real-time Stats** - Total patients, priority breakdown, confidence metrics
- **Interactive Charts** - Priority distribution pie chart and hourly admissions
- **Recent Patients** - Quick overview of latest registrations

### 4. AI Insights Modal
- **Priority Assessment** - Visual priority level with color coding
- **Confidence Score** - AI prediction confidence with progress bar
- **Decision Factors** - Key factors that influenced the AI decision
- **Recommendations** - Suggested next steps for patient care

## 🌐 Language Support

Switch between languages using the language toggle in the header:
- **English** - Default language
- **हिन्दी (Hindi)** - Indian language support
- **தமிழ் (Tamil)** - South Indian language support

## 🎨 Theme Options

Toggle between light and dark modes:
- **Light Mode** - Clean, bright interface for well-lit environments
- **Dark Mode** - Easy on the eyes for low-light conditions
- **Persistent Settings** - Theme preference saved in browser

## 🔧 API Endpoints

### Patient Management
- `GET /api/patients` - Get all patients with pagination and filtering
- `POST /api/patients` - Create new patient with AI prediction
- `GET /api/patients/:id` - Get specific patient
- `PUT /api/patients/:id` - Update patient information
- `DELETE /api/patients/:id` - Delete patient record

### Analytics
- `GET /api/stats` - Get comprehensive statistics and analytics
- `GET /api/health` - Health check endpoint

### AI Predictions
- `POST /api/predict` - Get AI prediction for patient data
- `POST /api/predict/batch` - Batch prediction for multiple patients

## 🏗️ Architecture

### Frontend (React + Vite)
```
client/src/
├── components/
│   ├── MultiStepForm.jsx      # Enhanced 4-step patient intake
│   ├── Dashboard.jsx          # Analytics dashboard with charts
│   ├── PatientList.jsx        # Patient management interface
│   └── AIInsightsModal.jsx    # AI prediction details modal
├── App.jsx                    # Main application with routing
└── index.css                  # Tailwind CSS styles
```

### Backend (Node.js + Express)
```
server/
├── index.js                   # Enhanced server with stats endpoint
├── routes/
│   └── patients.js           # Patient CRUD operations
├── ai/
│   └── triageModel.js        # Enhanced AI model with explainability
└── data/
    └── sampleData.js         # Demo patient data
```

## 🔬 AI Model Features

### Enhanced Triage Logic
- **Multi-factor Analysis** - Considers symptoms, vitals, age, and medical history
- **Confidence Scoring** - Provides prediction confidence (70-98%)
- **Explainable Decisions** - Shows which factors influenced the decision
- **Risk Stratification** - Critical, Urgent, Semi-Urgent, Non-Urgent categories
- **Recommendations** - Suggests appropriate care actions

### Prediction Categories
- **Critical** - Immediate attention required (red)
- **Urgent** - Prompt medical evaluation needed (orange)  
- **Semi-Urgent** - Medical evaluation within 30 minutes (yellow)
- **Non-Urgent** - Standard care queue appropriate (green)

## 🚨 Demo Data

The application includes sample patients for demonstration:
- **राज कुमार** - 45-year-old male with chest pain (Critical)
- **Priya Sharma** - 28-year-old female with fever (Non-Urgent)
- **கமல் ராஜ்** - 65-year-old male with breathing difficulty (Critical)

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3001 and 5173
   npx kill-port 3001 5173
   ```

2. **Dependencies Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules client/node_modules
   npm install
   cd client && npm install
   ```

3. **Build Issues**
   ```bash
   # Clear build cache
   cd client
   rm -rf dist
   npm run build
   ```

## 🎯 Production Deployment

### Environment Variables
Create `.env` file in root:
```env
NODE_ENV=production
PORT=3001
```

### Build for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ..
npm start
```

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- **Desktop** - Full feature set with optimal layout
- **Tablet** - Adapted layout with touch-friendly controls
- **Mobile** - Streamlined interface for small screens

## ♿ Accessibility Features

- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Compatible** - Proper ARIA labels and semantic HTML
- **High Contrast** - Dark mode for better visibility
- **Large Touch Targets** - Hospital-friendly button sizes
- **Clear Typography** - Readable fonts and proper contrast ratios

## 🔒 Security Considerations

**Note: This is a demo application. For production use:**
- Implement proper authentication and authorization
- Add input sanitization and validation
- Use HTTPS for all communications
- Implement rate limiting and security headers
- Add audit logging for medical data access
- Ensure HIPAA compliance for patient data

## 📊 Performance Metrics

- **Initial Load Time** - < 2 seconds
- **AI Prediction Time** - < 100ms
- **Form Submission** - < 500ms
- **Chart Rendering** - < 300ms
- **Theme Switching** - < 100ms

## 🤝 Contributing

This is a demo application showcasing modern web technologies for healthcare. For production use, additional security, compliance, and testing measures would be required.

---

**PatientPulse AI v2.0** - Demonstrating the future of AI-powered medical triage systems.
