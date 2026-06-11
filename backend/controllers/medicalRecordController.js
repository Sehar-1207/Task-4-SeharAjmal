import { MedicalRecord } from '../models/medicalRecord.js';
import mongoose from 'mongoose';

export const getAllRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find().populate('patient doctor').sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

export const createMedicalRecord = async (req, res, next) => {
  try {
    const { patientId, doctorId, diagnosis, prescription, vitals, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ 
        error: "Bad Request: One or more provided system identifier keys do not match a valid 24-character hexadecimal MongoDB ObjectId structure." 
      });
    }

    const record = await MedicalRecord.create({ 
      patient: patientId, 
      doctor: doctorId, 
      diagnosis, 
      prescription, 
      vitals, 
      notes 
    });

    const populatedRecord = await record.populate(['patient', 'doctor']);
    res.status(201).json(populatedRecord);
  } catch (error) { 
    next(error); 
  }
};

export const getPatientHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: "Invalid structural Patient ID referenced." });
    }

    const history = await MedicalRecord.find({ patient: patientId })
      .populate('doctor')
      .sort({ createdAt: -1 }); 
      
    res.status(200).json(history);
  } catch (error) { 
    next(error); 
  }
};

export const getMedicalRecordById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Malformed Document ID format configuration." });
    }

    const record = await MedicalRecord.findById(req.params.id).populate(['patient', 'doctor']);
    if (!record) return res.status(404).json({ error: 'Case file not found inside database registries.' });
    
    res.status(200).json(record);
  } catch (error) { 
    next(error); 
  }
};

export const updateMedicalRecord = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Malformed Document ID format configuration." });
    }

    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after', 
      runValidators: true 
    }).populate(['patient', 'doctor']);
    
    if (!record) return res.status(404).json({ error: 'Case file matching index index not found.' });
    res.status(200).json(record);
  } catch (error) { 
    next(error); 
  }
};

export const deleteMedicalRecord = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Malformed Document ID format configuration." });
    }

    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: 'Medical record item matching index not found.' });
    
    res.status(200).json({ message: 'Clinical ledger document item removed successfully from MongoDB instance.' });
  } catch (error) { 
    next(error); 
  }
};