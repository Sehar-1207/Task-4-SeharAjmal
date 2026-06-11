
import { Doctor } from '../models/doctor.js';
import { Appointment } from '../models/appointment.js';

export const createDoctor = async (req, res, next) => {
  try {
    const { name, specialty, email } = req.body;
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) return res.status(400).json({ error: 'Email registered to another doctor.' });
    
    const doctor = await Doctor.create({ name, specialty, email });
    res.status(201).json(doctor);
  } catch (error) { next(error); }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.status(200).json(doctors);
  } catch (error) { next(error); }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });
    res.status(200).json(doctor);
  } catch (error) { next(error); }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!doctor) return res.status(404).json({ error: 'Doctor record not found.' });
    res.status(200).json(doctor);
  } catch (error) { next(error); }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor record not found.' });
    
    await Appointment.updateMany({ doctor: req.params.id }, { status: 'Cancelled' });
    
    res.status(200).json({ message: 'Doctor profile removed; dependent appointments cancelled.' });
  } catch (error) { next(error); }
};