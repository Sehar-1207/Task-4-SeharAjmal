import express from 'express';
import { 
  getAllRecords, 
  createMedicalRecord, 
  getPatientHistory, 
  getMedicalRecordById, 
  updateMedicalRecord, 
  deleteMedicalRecord 
} from '../controllers/medicalRecordController.js';

const router = express.Router();

router.route('/')
  .get(getAllRecords) 
  .post(createMedicalRecord);

router.route('/:id')
  .get(getMedicalRecordById)
  .put(updateMedicalRecord)
  .delete(deleteMedicalRecord);

router.route('/patient/:patientId')
  .get(getPatientHistory);

export default router;