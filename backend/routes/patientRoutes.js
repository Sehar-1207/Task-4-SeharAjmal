
import express from 'express';
import { 
  createPatient, 
  getAllPatients, 
  getPatientById, 
  updatePatient, 
  deletePatient 
} from '../controllers/patientController.js';

const router = express.Router();

router.route('/')
  .post(createPatient)
  .get(getAllPatients);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient)
  .delete(deletePatient);

export default router;