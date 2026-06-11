import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';

import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import medicalRecordRoutes from './routes/medicalRecordRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: "Bad Request: Malformed JSON syntax parsing exception. Ensure strings do not contain raw unescaped line breaks or unescaped backslashes."
    });
  }
  next();
});

try {
  const swaggerDocument = yaml.load(
    fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8')
  );
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(' Interactive Documentation generated live at: http://localhost:3000/api-docs');
} catch (e) {
  console.error(' Swagger configuration parser error:', e.message);
}

app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', medicalRecordRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Requested operational route target '${req.originalUrl}' does not exist.` });
});

app.use((err, req, res, next) => {
  console.error(" Diagnostic Trace Capture:", err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: "Schema constraint validation failure.", details: err.message });
  }
  
  res.status(500).json({ 
    error: "A critical system process operation failed inside the backend engine.",
    details: err.message
  });
});

export default app;