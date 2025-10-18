# PatientPulse AI - Setup Guide

## Quick Start

Follow these steps to get PatientPulse AI running on your system:

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation Steps

1. **Install Root Dependencies**
   ```bash
   npm install
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Run the Application**
   
   From the root directory, run:
   ```bash
   npm run dev
   ```

   This will start both the backend server and frontend simultaneously:
   - Backend API: http://localhost:3001
   - Frontend UI: http://localhost:5173

### Alternative: Run Services Separately

**Backend Only:**
```bash
npm run server
```

**Frontend Only:**
```bash
cd client
npm run dev
```

### Verifying Installation

1. Open your browser and navigate to http://localhost:5173
2. You should see the PatientPulse AI interface
3. Try the "Load Demo Case" button to test the system
4. Submit the form to see AI predictions in action

### Troubleshooting

**Port Already in Use:**
- If port 3001 or 5173 is already in use, modify the ports in:
  - Backend: `server/index.js` (change PORT variable)
  - Frontend: `client/vite.config.js` (change server.port)

**Module Not Found Errors:**
- Ensure you've run `npm install` in both root and client directories
- Try deleting `node_modules` folders and `package-lock.json` files, then reinstall

**TensorFlow.js Issues:**
- TensorFlow.js loads automatically in the browser
- Check browser console for any WebGL-related warnings
- Ensure you're using a modern browser (Chrome, Firefox, Edge)

### Features to Test

1. **Triage Tab:**
   - Enter patient information manually
   - Use autocomplete for symptoms
   - Load demo cases for quick testing
   - See real-time AI predictions

2. **Patients Tab:**
   - View all patient records
   - Search and filter patients
   - Export data to CSV
   - Delete records

3. **Dashboard Tab:**
   - View patient statistics
   - See urgency level distribution
   - Monitor recent cases
   - Track AI confidence metrics

4. **Multilingual Support:**
   - Click the language toggle in the header
   - Switch between English and Hindi

### Demo Data

The system comes pre-loaded with 10 sample emergency cases:
- 4 Critical cases
- 3 Urgent cases
- 3 Non-Urgent cases

These demonstrate various medical scenarios typical in Indian emergency rooms.

### Technology Stack

- **Frontend:** React 18 + Vite
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **AI:** TensorFlow.js (runs in browser)
- **Backend:** Node.js + Express
- **API Client:** Axios

### Next Steps

- Test all features thoroughly
- Try different patient scenarios
- Experiment with the multilingual interface
- Review the AI predictions and confidence scores

### Support

For issues or questions, check:
- README.md for project overview
- Source code comments for implementation details
- Console logs for debugging information

---

**Note:** This is a demonstration prototype. Not intended for production medical use without proper validation, regulatory compliance, and integration with actual hospital systems.
