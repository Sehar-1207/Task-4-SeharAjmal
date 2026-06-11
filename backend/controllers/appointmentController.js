import { Appointment } from '../models/appointment.js';
import { Patient } from '../models/patient.js';
import { Doctor } from '../models/doctor.js';

export const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, symptoms } = req.body;
    const patientExists = await Patient.findById(patientId);
    const doctorExists = await Doctor.findById(doctorId);

    if (!patientExists || !doctorExists) {
      return res.status(404).json({ error: 'Invalid Patient or Doctor system parameters mapped.' });
    }

    const appointment = await Appointment.create({ patient: patientId, doctor: doctorId, date, symptoms });
    const fullyPopulated = await appointment.populate(['patient', 'doctor']);
    res.status(201).json(fullyPopulated);
  } catch (error) { next(error); }
};

export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find().populate('patient').populate('doctor').sort({ date: 1 });
    res.status(200).json(appointments);
  } catch (error) { next(error); }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(['patient', 'doctor']);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });
    res.status(200).json(appointment);
  } catch (error) { next(error); }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate(['patient', 'doctor']);
    
    if (!appointment) return res.status(404).json({ error: 'Appointment target missing.' });
    res.status(200).json(appointment);
  } catch (error) { next(error); }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment record not found.' });
    res.status(200).json({ message: 'Appointment ticket slot deleted from engine registry.' });
  } catch (error) { next(error); }
};