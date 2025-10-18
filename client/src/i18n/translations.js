export const translations = {
  en: {
    appTitle: 'PatientPulse AI',
    subtitle: 'Zero-Latency Medical Triage System',
    tabs: {
      triage: 'Triage',
      patients: 'Patients',
      dashboard: 'Dashboard'
    },
    form: {
      title: 'Patient Information',
      name: 'Full Name',
      namePlaceholder: 'Enter patient name',
      age: 'Age',
      agePlaceholder: 'Enter age',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      symptoms: 'Symptoms',
      symptomsPlaceholder: 'Select or type symptoms',
      vitals: 'Vital Signs',
      heartRate: 'Heart Rate (bpm)',
      heartRatePlaceholder: '60-100',
      bloodPressure: 'Blood Pressure',
      bloodPressurePlaceholder: '120/80',
      temperature: 'Temperature (°C)',
      temperaturePlaceholder: '36.5-37.5',
      oxygenSaturation: 'Oxygen Saturation (%)',
      oxygenSaturationPlaceholder: '95-100',
      medicalHistory: 'Medical History',
      medicalHistoryPlaceholder: 'Previous conditions, allergies, medications...',
      submit: 'Analyze & Predict',
      reset: 'Reset Form',
      loadDemo: 'Load Demo Case'
    },
    result: {
      title: 'Triage Assessment',
      urgency: 'Urgency Level',
      confidence: 'Confidence',
      critical: 'CRITICAL',
      urgent: 'URGENT',
      nonUrgent: 'NON-URGENT',
      criticalMessage: 'Requires immediate medical attention',
      urgentMessage: 'Needs prompt medical care',
      nonUrgentMessage: 'Can wait for standard care',
      noResult: 'Submit patient information to get AI triage prediction'
    },
    patients: {
      title: 'Patient History',
      search: 'Search patients...',
      filter: 'Filter by Urgency',
      all: 'All',
      noPatients: 'No patients found',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this patient record?',
      export: 'Export to CSV'
    },
    dashboard: {
      title: 'Emergency Room Dashboard',
      totalPatients: 'Total Patients',
      criticalCases: 'Critical Cases',
      urgentCases: 'Urgent Cases',
      nonUrgentCases: 'Non-Urgent Cases',
      distributionTitle: 'Patient Distribution by Urgency',
      recentCases: 'Recent Cases',
      avgConfidence: 'Avg. Confidence'
    },
    symptoms: [
      'Chest Pain',
      'Difficulty Breathing',
      'Shortness of Breath',
      'Severe Headache',
      'Abdominal Pain',
      'Fever',
      'Cough',
      'Nausea',
      'Vomiting',
      'Dizziness',
      'Seizure',
      'Unconscious',
      'Severe Bleeding',
      'Fracture',
      'Severe Allergic Reaction',
      'Wheezing',
      'Body Ache',
      'Back Pain',
      'Laceration',
      'Swelling',
      'Stroke Symptoms',
      'Burns',
      'Poisoning'
    ],
    notifications: {
      patientAdded: 'Patient record added successfully',
      patientUpdated: 'Patient record updated successfully',
      patientDeleted: 'Patient record deleted successfully',
      error: 'An error occurred. Please try again.'
    }
  },
  hi: {
    appTitle: 'पेशेंटपल्स एआई',
    subtitle: 'शून्य-विलंब चिकित्सा ट्राइएज प्रणाली',
    tabs: {
      triage: 'ट्राइएज',
      patients: 'रोगी',
      dashboard: 'डैशबोर्ड'
    },
    form: {
      title: 'रोगी की जानकारी',
      name: 'पूरा नाम',
      namePlaceholder: 'रोगी का नाम दर्ज करें',
      age: 'आयु',
      agePlaceholder: 'आयु दर्ज करें',
      gender: 'लिंग',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
      symptoms: 'लक्षण',
      symptomsPlaceholder: 'लक्षण चुनें या टाइप करें',
      vitals: 'महत्वपूर्ण संकेत',
      heartRate: 'हृदय गति (बीपीएम)',
      heartRatePlaceholder: '60-100',
      bloodPressure: 'रक्तचाप',
      bloodPressurePlaceholder: '120/80',
      temperature: 'तापमान (°C)',
      temperaturePlaceholder: '36.5-37.5',
      oxygenSaturation: 'ऑक्सीजन संतृप्ति (%)',
      oxygenSaturationPlaceholder: '95-100',
      medicalHistory: 'चिकित्सा इतिहास',
      medicalHistoryPlaceholder: 'पिछली स्थितियां, एलर्जी, दवाएं...',
      submit: 'विश्लेषण और भविष्यवाणी',
      reset: 'फॉर्म रीसेट करें',
      loadDemo: 'डेमो केस लोड करें'
    },
    result: {
      title: 'ट्राइएज मूल्यांकन',
      urgency: 'तात्कालिकता स्तर',
      confidence: 'विश्वास',
      critical: 'गंभीर',
      urgent: 'अत्यावश्यक',
      nonUrgent: 'सामान्य',
      criticalMessage: 'तत्काल चिकित्सा ध्यान की आवश्यकता है',
      urgentMessage: 'शीघ्र चिकित्सा देखभाल की आवश्यकता है',
      nonUrgentMessage: 'मानक देखभाल के लिए प्रतीक्षा कर सकते हैं',
      noResult: 'एआई ट्राइएज भविष्यवाणी प्राप्त करने के लिए रोगी की जानकारी सबमिट करें'
    },
    patients: {
      title: 'रोगी इतिहास',
      search: 'रोगी खोजें...',
      filter: 'तात्कालिकता के अनुसार फ़िल्टर करें',
      all: 'सभी',
      noPatients: 'कोई रोगी नहीं मिला',
      actions: 'क्रियाएं',
      view: 'देखें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      deleteConfirm: 'क्या आप वाकई इस रोगी रिकॉर्ड को हटाना चाहते हैं?',
      export: 'CSV में निर्यात करें'
    },
    dashboard: {
      title: 'आपातकालीन कक्ष डैशबोर्ड',
      totalPatients: 'कुल रोगी',
      criticalCases: 'गंभीर मामले',
      urgentCases: 'अत्यावश्यक मामले',
      nonUrgentCases: 'सामान्य मामले',
      distributionTitle: 'तात्कालिकता के अनुसार रोगी वितरण',
      recentCases: 'हालिया मामले',
      avgConfidence: 'औसत विश्वास'
    },
    symptoms: [
      'सीने में दर्द',
      'सांस लेने में कठिनाई',
      'सांस की तकलीफ',
      'गंभीर सिरदर्द',
      'पेट में दर्द',
      'बुखार',
      'खांसी',
      'मतली',
      'उल्टी',
      'चक्कर आना',
      'दौरा',
      'बेहोश',
      'गंभीर रक्तस्राव',
      'हड्डी टूटना',
      'गंभीर एलर्जी प्रतिक्रिया',
      'घरघराहट',
      'शरीर में दर्द',
      'पीठ दर्द',
      'घाव',
      'सूजन',
      'स्ट्रोक के लक्षण',
      'जलन',
      'विषाक्तता'
    ],
    notifications: {
      patientAdded: 'रोगी रिकॉर्ड सफलतापूर्वक जोड़ा गया',
      patientUpdated: 'रोगी रिकॉर्ड सफलतापूर्वक अपडेट किया गया',
      patientDeleted: 'रोगी रिकॉर्ड सफलतापूर्वक हटाया गया',
      error: 'एक त्रुटि हुई। कृपया पुन: प्रयास करें।'
    }
  }
};

export const useTranslation = (language = 'en') => {
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  };
  
  return { t };
};
