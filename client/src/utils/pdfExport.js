/**
 * PDF Export utility for patient records
 * Note: Using a simple HTML-to-print approach
 * For production, consider libraries like jsPDF or pdfmake
 */

export const exportPatientsToPDF = (patients, title = 'Patient History Report') => {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        h1 {
          color: #2563eb;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #2563eb;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .critical {
          background-color: #fee2e2;
          color: #991b1b;
          font-weight: bold;
        }
        .urgent {
          background-color: #fef3c7;
          color: #92400e;
          font-weight: bold;
        }
        .non-urgent {
          background-color: #d1fae5;
          color: #065f46;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Total Patients:</strong> ${patients.length}</p>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Symptoms</th>
            <th>Heart Rate</th>
            <th>BP</th>
            <th>Temp</th>
            <th>O2</th>
            <th>Urgency</th>
            <th>Confidence</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${patients.map(patient => `
            <tr>
              <td>${patient.name}</td>
              <td>${patient.age}</td>
              <td>${patient.gender}</td>
              <td>${patient.symptoms.join(', ')}</td>
              <td>${patient.vitals.heartRate}</td>
              <td>${patient.vitals.bloodPressure}</td>
              <td>${patient.vitals.temperature}°C</td>
              <td>${patient.vitals.oxygenSaturation}%</td>
              <td class="${patient.urgency.toLowerCase().replace('-', '')}">${patient.urgency}</td>
              <td>${patient.confidence}%</td>
              <td>${new Date(patient.timestamp).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>PatientPulse AI - Medical Triage System</p>
        <p>This is a demonstration prototype - Not for production medical use</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
};

export const exportSinglePatientPDF = (patient) => {
  exportPatientsToPDF([patient], `Patient Report - ${patient.name}`);
};
