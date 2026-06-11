
import { Patient } from '../models/patient.js';
import { Appointment } from '../models/appointment.js';
import { MedicalRecord } from '../models/medicalRecord.js';

export const createPatient = async (req, res, next) => {
  try {
    const { name, email, phone, dateOfBirth, gender, bloodType } = req.body;
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ error: 'A patient with this email already exists.' });
    }
    const patient = await Patient.create({ name, email, phone, dateOfBirth, gender, bloodType });
    res.status(201).json(patient);
  } catch (error) { next(error); }
};

export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json(patients);
  } catch (error) { next(error); }
};

export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    res.status(200).json(patient);
  } catch (error) { next(error); }
};

export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    res.status(200).json(patient);
  } catch (error) { next(error); }
};

export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    
    await Appointment.deleteMany({ patient: req.params.id });
    await MedicalRecord.deleteMany({ patient: req.params.id });
    
    res.status(200).json({ message: 'Patient profile and all related records purged successfully.' });
  } catch (error) { next(error); }
};