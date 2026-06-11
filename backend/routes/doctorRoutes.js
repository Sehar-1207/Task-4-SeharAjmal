
import express from 'express';
import { 
  createDoctor, 
  getAllDoctors, 
  getDoctorById, 
  updateDoctor, 
  deleteDoctor 
} from '../controllers/doctorController.js';

const router = express.Router();

router.route('/')
  .post(createDoctor)
  .get(getAllDoctors);

router.route('/:id')
  .get(getDoctorById)
  .put(updateDoctor)
  .delete(deleteDoctor);

export default router;