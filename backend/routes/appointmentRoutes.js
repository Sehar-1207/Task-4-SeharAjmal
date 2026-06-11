
import express from 'express';
import { 
  createAppointment, 
  getAllAppointments, 
  getAppointmentById, 
  updateAppointment, 
  deleteAppointment 
} from '../controllers/appointmentController.js';

const router = express.Router();

router.route('/')
  .post(createAppointment)
  .get(getAllAppointments);

router.route('/:id')
  .get(getAppointmentById)
  .put(updateAppointment)
  .delete(deleteAppointment);

export default router;